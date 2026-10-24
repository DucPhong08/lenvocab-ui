import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import RNFS from 'react-native-fs';
import { getCardAudio } from '@/api/endpoints/getCardAudio';
import { AudioContext } from '@/hooks/audioContext';
import { useAudio } from '@/hooks/useAudio';

const mockSpeed = jest.fn();
const mockPlay = jest.fn();
jest.mock('@/api/endpoints/getCardAudio', () => ({ getCardAudio: jest.fn() }));
jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/tmp',
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
}));
jest.mock(
  'react-native-sound',
  () =>
    class {
      static setCategory = jest.fn();
      constructor(
        _path: string,
        _base: string,
        callback: (error: null) => void,
      ) {
        Promise.resolve().then(() => callback(null));
      }
      setSpeed = mockSpeed;
      play = mockPlay;
      stop = jest.fn((callback: () => void) => callback());
      release = jest.fn();
    },
);

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getCardAudio).mockResolvedValue({ audio_base64: 'offline-mp3' });
});

async function player(token: string | null = 'user-token', speed = 1.25) {
  let audio!: ReturnType<typeof useAudio>;
  const Harness = () => {
    audio = useAudio();
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AudioContext.Provider value={{ token, speed }}>
        <Harness />
      </AudioContext.Provider>,
    );
  });
  return {
    renderer,
    Harness,
    get audio() {
      return audio;
    },
  };
}

test('downloads audio only on demand and applies the selected native playback speed', async () => {
  const state = await player();
  try {
    expect(getCardAudio).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () =>
      state.audio.play(null, 'owned-card'),
    );
    expect(getCardAudio).toHaveBeenCalledWith('user-token', 'owned-card');
    expect(RNFS.writeFile).toHaveBeenCalledWith(
      expect.any(String),
      'offline-mp3',
      'base64',
    );
    expect(mockSpeed).toHaveBeenCalledWith(1.25);
    expect(mockPlay).toHaveBeenCalledTimes(1);
  } finally {
    await ReactTestRenderer.act(async () => state.renderer.unmount());
  }
});

test('plays inline scan audio without a second network request', async () => {
  const state = await player(null, 0.75);
  try {
    await ReactTestRenderer.act(async () => state.audio.play('scan-mp3'));
    expect(getCardAudio).not.toHaveBeenCalled();
    expect(mockSpeed).toHaveBeenCalledWith(0.75);
  } finally {
    await ReactTestRenderer.act(async () => state.renderer.unmount());
  }
});

test('discards an audio download when the session changes', async () => {
  let resolve!: (result: { audio_base64: string }) => void;
  jest.mocked(getCardAudio).mockReturnValue(
    new Promise(done => {
      resolve = done;
    }),
  );
  const state = await player();
  try {
    let pending!: Promise<void>;
    await ReactTestRenderer.act(async () => {
      pending = state.audio.play(null, 'owned-card');
    });
    await ReactTestRenderer.act(async () => {
      state.renderer.update(
        <AudioContext.Provider value={{ token: null, speed: 1 }}>
          <state.Harness />
        </AudioContext.Provider>,
      );
    });
    await ReactTestRenderer.act(async () => {
      resolve({ audio_base64: 'stale-mp3' });
      await pending;
    });
    expect(RNFS.writeFile).not.toHaveBeenCalled();
    expect(mockPlay).not.toHaveBeenCalled();
  } finally {
    await ReactTestRenderer.act(async () => state.renderer.unmount());
  }
});

test('separate players do not overwrite the same temporary audio file', async () => {
  const first = await player();
  const second = await player();
  try {
    await ReactTestRenderer.act(async () => {
      await first.audio.play('first');
      await second.audio.play('second');
    });
    const paths = jest.mocked(RNFS.writeFile).mock.calls.map(([path]) => path);
    expect(new Set(paths).size).toBe(2);
  } finally {
    await ReactTestRenderer.act(async () => {
      first.renderer.unmount();
      second.renderer.unmount();
    });
  }
});
