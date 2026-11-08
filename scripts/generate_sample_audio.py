#!/usr/bin/env python3
"""Generate bundled sample-word MP3s with the backend's existing Polly profile."""

import argparse
import base64
import hashlib
import json
import re
import sys
from concurrent.futures import FIRST_COMPLETED, ThreadPoolExecutor, wait
from datetime import datetime, timezone
from pathlib import Path


def digest(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def valid_mp3(audio):
    if not isinstance(audio, str):
        return False
    try:
        data = base64.b64decode(audio, validate=True)
    except (ValueError, TypeError):
        return False
    if len(data) < 128:
        return False
    offset = 0
    if data[:3] == b"ID3":
        if len(data) < 10 or any(value & 0x80 for value in data[6:10]):
            return False
        offset = 10 + sum(value << shift for value, shift in zip(data[6:10], (21, 14, 7, 0)))
    header = data[offset : offset + 4]
    return (
        len(header) == 4
        and header[0] == 0xFF
        and header[1] & 0xE0 == 0xE0
        and (header[1] >> 3) & 3 != 1
        and (header[1] >> 1) & 3 != 0
        and (header[2] >> 4) not in (0, 15)
        and (header[2] >> 2) & 3 != 3
    )


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def error_code(cause):
    # Never print exception messages: SDK/config errors can contain account details.
    response = getattr(cause, "response", {})
    code = response.get("Error", {}).get("Code", type(cause).__name__)
    return code if re.fullmatch(r"[A-Za-z0-9_]+", code) else type(cause).__name__


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--backend-path", type=Path, required=True)
    parser.add_argument("--cache", type=Path, required=True, help="Resumable local cache; contains public terms' audio only")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--check", action="store_true", help="Validate existing bundled audio without sending synthesis requests")
    args = parser.parse_args()
    sys.path.insert(0, str(args.backend_path.resolve()))

    try:
        from app.config import settings
        import boto3
        from botocore.config import Config
    except Exception as cause:
        print(f"configuration_error={error_code(cause)}", file=sys.stderr)
        return 1

    profile = {
        "provider": "Amazon Polly",
        "voice_id": settings.POLLY_VOICE_ID,
        "engine": settings.POLLY_ENGINE,
        "output_format": settings.POLLY_OUTPUT_FORMAT,
        "sample_rate_hz": 22050,
        "region": settings.AWS_REGION,
        "text_type": "text",
    }
    if profile["output_format"] != "mp3":
        print("configuration_error=MP3Required", file=sys.stderr)
        return 1
    source = json.loads((args.root / "assets/data/vocab-core.json").read_text(encoding="utf-8"))
    words = source["words"]
    if len(words) != 200 or len({word["id"] for word in words}) != 200:
        print("source_error=Expected200UniqueIds", file=sys.stderr)
        return 1
    output = args.root / "assets/data/vocab-audio.json"
    manifest_path = args.root / "assets/audio/provenance.json"
    terms = {word["id"]: digest(word["term"]) for word in words}
    clips = {}
    if output.exists() and manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        existing = json.loads(output.read_text(encoding="utf-8"))
        if manifest.get("profile") == profile:
            clips = {
                key: value for key, value in existing.items()
                if manifest.get("term_sha256", {}).get(key) == terms.get(key) and valid_mp3(value)
            }
    if not args.check and args.cache.exists():
        cache = json.loads(args.cache.read_text(encoding="utf-8"))
        if cache.get("profile") == profile:
            clips.update({
                key: value for key, value in cache.get("clips", {}).items()
                if cache.get("term_sha256", {}).get(key) == terms.get(key) and valid_mp3(value)
            })
    clips = {key: value for key, value in clips.items() if key in terms}
    print(f"validated={len(clips)}/{len(words)}")
    missing = [word for word in words if word["id"] not in clips]
    if args.check:
        return 1 if missing else 0

    def save_cache():
        write_json(args.cache, {"profile": profile, "term_sha256": terms, "clips": clips})

    def synthesize(word):
        try:
            response = client.synthesize_speech(
                Text=word["term"], TextType="text", OutputFormat="mp3",
                VoiceId=profile["voice_id"], Engine=profile["engine"], SampleRate="22050",
            )
            with response["AudioStream"] as stream:
                data = stream.read()
            audio = base64.b64encode(data).decode("ascii")
            if not valid_mp3(audio):
                return word["id"], None, "InvalidMP3"
            return word["id"], audio, None
        except Exception as cause:
            return word["id"], None, error_code(cause)

    if missing:
        try:
            # Match backend credentials and profile without copying .env or logging secrets.
            session = boto3.Session(
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID or None,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY or None,
                region_name=profile["region"],
            )
            client = session.client("polly", config=Config(
                connect_timeout=5, read_timeout=20, max_pool_connections=3,
                retries={"total_max_attempts": 1},
            ))
        except Exception as cause:
            print(f"client_error={error_code(cause)}", file=sys.stderr)
            return 1
        pending_words = iter(missing)
        halted = False
        try:
            with ThreadPoolExecutor(max_workers=3) as pool:
                pending = {pool.submit(synthesize, word) for word in list(missing)[:3]}
                for _ in range(min(3, len(missing))):
                    next(pending_words)
                while pending:
                    finished, pending = wait(pending, return_when=FIRST_COMPLETED)
                    for future in finished:
                        key, audio, failure = future.result()
                        if failure:
                            halted = True
                            print(f"id={key} error={failure}", file=sys.stderr)
                            continue
                        clips[key] = audio
                        save_cache()
                        print(f"count={len(clips)}/200 id={key} bytes={len(base64.b64decode(audio))}", flush=True)
                    if halted:
                        continue
                    for _ in finished:
                        word = next(pending_words, None)
                        if word is not None:
                            pending.add(pool.submit(synthesize, word))
        finally:
            client.close()
        if halted:
            print(f"incomplete={len(clips)}/200; inspect the error before resuming", file=sys.stderr)
            return 1

    ordered = {word["id"]: clips[word["id"]] for word in words}
    total_bytes = sum(len(base64.b64decode(value)) for value in ordered.values())
    write_json(output, ordered)
    write_json(manifest_path, {
        "schema_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "disclosure": "AI-generated speech; no human voice recording.",
        "profile": profile,
        "clip_count": len(ordered),
        "total_mp3_bytes": total_bytes,
        "term_sha256": terms,
    })
    print(f"complete={len(ordered)}/200 mp3_bytes={total_bytes} json_bytes={output.stat().st_size}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as cause:
        print(f"generation_error={error_code(cause)}", file=sys.stderr)
        sys.exit(1)
