"""Download the pinned experimental model; never runs inside the mobile app."""
from pathlib import Path
from urllib.request import urlopen
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parents[1] / 'assets/models'
manifest = json.loads((root / 'manifest.json').read_text())
target = root / manifest['file']
if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() == manifest['sha256']:
    print('Offline model already verified.')
    raise SystemExit(0)
assert manifest['source'].startswith('https://storage.googleapis.com/download.tensorflow.org/models/'), 'Unexpected model source'
with urlopen(manifest['source'], timeout=60) as response:
    data = response.read(10_000_001)
assert len(data) == manifest['bytes'], 'Model size changed'
assert hashlib.sha256(data).hexdigest() == manifest['sha256'], 'Model checksum changed'
temporary = target.with_suffix('.download')
temporary.write_bytes(data)
try:
    with zipfile.ZipFile(temporary) as model:
        labels = model.read('labelmap.txt')
        assert hashlib.sha256(labels).hexdigest() == manifest['labels_sha256'], 'Label indices changed'
    temporary.replace(target)
finally:
    temporary.unlink(missing_ok=True)
print('Downloaded and verified EfficientDet-Lite0 experimental model.')
