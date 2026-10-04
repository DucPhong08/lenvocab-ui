import { useCallback, useEffect, useRef, useState } from 'react';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';

try {
  Sound.setCategory('Playback');
} catch {
  // Bỏ qua nếu module native chưa sẵn sàng
}

/**
 * Phát audio từ chuỗi base64 MP3 (sinh từ AWS Polly).
 * Tự dọn dẹp khi component unmount, hỗ trợ theo dõi trạng thái đang phát (isPlaying).
 */
export function useAudio() {
  const soundRef = useRef<Sound | null>(null);
  const fileRef = useRef<string | null>(null);
  const requestRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      requestRef.current += 1;
      try {
        soundRef.current?.stop(() => soundRef.current?.release());
      } catch {
        // Safe cleanup
      }
      if (fileRef.current) {
        RNFS.unlink(fileRef.current).catch(() => {});
      }
    };
  }, []);

  const stop = useCallback(() => {
    requestRef.current += 1;
    const path = fileRef.current;
    const sound = soundRef.current;
    fileRef.current = null;
    soundRef.current = null;
    if (!sound) {
      setIsPlaying(false);
      if (path) RNFS.unlink(path).catch(() => {});
      return;
    }
    try {
      sound.stop(() => {
        sound.release();
        setIsPlaying(false);
        if (path) RNFS.unlink(path).catch(() => {});
      });
    } catch {
      setIsPlaying(false);
      if (path) RNFS.unlink(path).catch(() => {});
    }
  }, []);

  const play = useCallback(async (base64: string | null | undefined) => {
    if (!base64) return;

    const requestId = ++requestRef.current;
    try {
      if (soundRef.current) {
        const previousSound = soundRef.current;
        previousSound.stop(() => previousSound.release());
        soundRef.current = null;
      }
      if (fileRef.current) {
        await RNFS.unlink(fileRef.current).catch(() => {});
      }

      setIsPlaying(true);
      const content = base64.replace(/^data:audio\/[\w.+-]+;base64,/, '');
      const path = `${RNFS.CachesDirectoryPath}/lenvocab-audio-${requestId}.mp3`;
      fileRef.current = path;
      await RNFS.writeFile(path, content, 'base64');

      if (requestId !== requestRef.current) {
        await RNFS.unlink(path).catch(() => {});
        return;
      }

      const sound = new Sound(`file://${path}`, '', error => {
        if (error) {
          setIsPlaying(false);
          sound.release();
          if (soundRef.current === sound) soundRef.current = null;
          if (fileRef.current === path) fileRef.current = null;
          RNFS.unlink(path).catch(() => {});
          return;
        }
        sound.play(_success => {
          setIsPlaying(false);
          sound.release();
          RNFS.unlink(path).catch(() => {});
          if (soundRef.current === sound) {
            soundRef.current = null;
          }
          if (fileRef.current === path) {
            fileRef.current = null;
          }
        });
      });

      soundRef.current = sound;
    } catch {
      setIsPlaying(false);
      if (fileRef.current) {
        RNFS.unlink(fileRef.current).catch(() => {});
        fileRef.current = null;
      }
    }
  }, []);

  return { play, stop, isPlaying };
}
