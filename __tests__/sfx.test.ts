import { playSfx, sfx, type SfxType } from '@/utils/sfx';
import Sound from 'react-native-sound';

const mockPlay = jest.fn((cb?: (success: boolean) => void) => cb?.(true));
const mockStop = jest.fn((cb?: () => void) => cb?.());
const mockRelease = jest.fn();

jest.mock('react-native-sound', () => {
  return jest.fn().mockImplementation((filename: string, basePath: string, callback?: (error: unknown, props: unknown) => void) => {
    const instance = {
      filename,
      basePath,
      play: mockPlay,
      stop: mockStop,
      release: mockRelease,
    };
    if (callback) {
      Promise.resolve().then(() => callback(null, {}));
    }
    return instance;
  });
});

describe('SFX Utility (Sound Effects)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each<[SfxType, string]>([
    ['flip', 'card_flip.mp3'],
    ['correct', 'answer_correct.mp3'],
    ['wrong', 'answer_wrong.mp3'],
    ['levelUp', 'level_up.mp3'],
  ])('plays %s with sound file %s', async (type, expectedFile) => {
    const onEnd = jest.fn();
    playSfx(type, onEnd);

    // Chờ microtask callback hoàn tất
    await Promise.resolve();

    expect(Sound).toHaveBeenCalledWith(
      expectedFile,
      expect.anything(),
      expect.any(Function),
    );
    expect(mockPlay).toHaveBeenCalledTimes(1);
    expect(mockRelease).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledWith(true);
  });

  test('handles sound load failure gracefully', async () => {
    const onEnd = jest.fn();
    jest.mocked(Sound).mockImplementationOnce((_filename, _basePath, callback) => {
      const instance = {
        play: mockPlay,
        stop: mockStop,
        release: mockRelease,
      };
      if (typeof callback === 'function') {
        const cb = callback;
        Promise.resolve().then(() => cb('Failed to load', {}));
      }
      return instance as any;
    });

    playSfx('flip', onEnd);
    await Promise.resolve();

    expect(mockPlay).not.toHaveBeenCalled();
    expect(mockRelease).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledWith(false);
  });

  test('cleans up and stops sound when returned cleanup function is invoked', async () => {
    jest.mocked(Sound).mockImplementationOnce(() => {
      return {
        play: mockPlay,
        stop: mockStop,
        release: mockRelease,
      } as any;
    });

    const stopFn = playSfx('levelUp');
    expect(typeof stopFn).toBe('function');

    stopFn();
    expect(mockStop).toHaveBeenCalled();
  });

  test('sfx object exposes play method', () => {
    expect(sfx.play).toBe(playSfx);
  });
});
