import Sound from 'react-native-sound';

export type SfxType = 'flip' | 'correct' | 'wrong' | 'levelUp';

const SFX_CONFIG: Record<SfxType, { file: string }> = {
  flip: { file: 'card_flip.mp3' },
  correct: { file: 'answer_correct.mp3' },
  wrong: { file: 'answer_wrong.mp3' },
  levelUp: { file: 'level_up.mp3' },
};

try {
  Sound.setCategory('Ambient', true);
} catch {
  // Bỏ qua nếu module native chưa sẵn sàng hoặc trong môi trường test
}

/**
 * Phát hiệu ứng âm thanh UI (SFX) từ bundle cục bộ.
 * Tự động giải phóng bộ nhớ native sau khi phát xong.
 */
export function playSfx(
  type: SfxType,
  onEnd?: (success: boolean) => void,
): () => void {
  try {
    const config = SFX_CONFIG[type];
    if (!config) {
      onEnd?.(false);
      return () => {};
    }

    let isReleased = false;
    let sound: Sound | null = null;

    const onLoaded = (error: unknown) => {
      if (!sound) {
        // Phòng ngừa trường hợp mock gọi callback đồng bộ trước khi gán biến
        Promise.resolve().then(() => onLoaded(error));
        return;
      }

      if (error || isReleased) {
        try {
          sound.release();
        } catch {
          // Safe cleanup
        }
        onEnd?.(false);
        return;
      }

      try {
        sound.play((success: boolean) => {
          try {
            sound?.release();
          } catch {
            // Safe cleanup
          }
          onEnd?.(success);
        });
      } catch {
        try {
          sound.release();
        } catch {
          // Safe cleanup
        }
        onEnd?.(false);
      }
    };

    sound = new Sound(config.file, Sound.MAIN_BUNDLE ?? '', onLoaded);

    return () => {
      isReleased = true;
      if (sound) {
        try {
          sound.stop(() => {
            try {
              sound?.release();
            } catch {
              // Safe cleanup
            }
          });
        } catch {
          // Safe cleanup
        }
      }
    };
  } catch {
    onEnd?.(false);
    return () => {};
  }
}

export const sfx = {
  play: playSfx,
};
