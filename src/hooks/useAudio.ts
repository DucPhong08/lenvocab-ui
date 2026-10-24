import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { ApiError } from '@/api/client/ApiError';
import { getCardAudio } from '@/api/endpoints/getCardAudio';
import { AudioContext } from './audioContext';
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
let nextPlayerId = 0;

export function useAudio() {
  const [playerId] = useState(() => ++nextPlayerId);
  const { token, speed, onUnauthorized } = useContext(AudioContext);
  const soundRef = useRef<Sound | null>(null);
  const fileRef = useRef<string | null>(null);
  const requestRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    return () => {
      requestRef.current += 1;
      const sound = soundRef.current;
      soundRef.current = null;
      try {
        sound?.stop(() => sound.release());
      } catch {
        // Safe cleanup
      }
      const path = fileRef.current;
      fileRef.current = null;
      if (path) RNFS.unlink(path).catch(() => {});
    };
  }, [token]);

  const stop = useCallback(() => {
    const requestId = ++requestRef.current;
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
        if (requestId === requestRef.current) setIsPlaying(false);
        if (path) RNFS.unlink(path).catch(() => {});
      });
    } catch {
      setIsPlaying(false);
      if (path) RNFS.unlink(path).catch(() => {});
    }
  }, []);

  const play = useCallback(
    async (base64: string | null | undefined, cardId?: string) => {
      if (!base64 && (!cardId || !token)) return;

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

        if (requestId !== requestRef.current) return;
        setIsPlaying(true);
        const audio =
          base64 || (await getCardAudio(token!, cardId!)).audio_base64;
        if (requestId !== requestRef.current) return;
        const content = audio.replace(/^data:audio\/[\w.+-]+;base64,/, '');
        const path = `${RNFS.CachesDirectoryPath}/lenvocab-audio-${playerId}-${requestId}.mp3`;
        fileRef.current = path;
        await RNFS.writeFile(path, content, 'base64');

        if (requestId !== requestRef.current) {
          await RNFS.unlink(path).catch(() => {});
          return;
        }

        const sound = new Sound(`file://${path}`, '', error => {
          if (error || requestId !== requestRef.current) {
            if (requestId === requestRef.current) setIsPlaying(false);
            sound.release();
            if (soundRef.current === sound) soundRef.current = null;
            if (fileRef.current === path) fileRef.current = null;
            RNFS.unlink(path).catch(() => {});
            return;
          }
          sound.setSpeed(speed);
          sound.play(_success => {
            if (requestId === requestRef.current) setIsPlaying(false);
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
      } catch (cause) {
        if (requestId !== requestRef.current) return;
        setIsPlaying(false);
        if (cause instanceof ApiError && cause.status === 401) {
          await onUnauthorized?.();
          return;
        }
        Alert.alert(
          'Không thể phát âm thanh',
          cause instanceof Error ? cause.message : 'Vui lòng thử lại.',
        );
        if (fileRef.current) {
          RNFS.unlink(fileRef.current).catch(() => {});
          fileRef.current = null;
        }
      }
    },
    [token, speed, playerId, onUnauthorized],
  );

  return { play, stop, isPlaying };
}
