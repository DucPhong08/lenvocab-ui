/* eslint-disable no-bitwise */
// MP3 frame validation reads the binary header fields.
import React from 'react';
import { Buffer } from 'buffer';
import ReactTestRenderer from 'react-test-renderer';
import RNFS from 'react-native-fs';
import sampleAudio from '../assets/data/vocab-audio.json';
import provenance from '../assets/audio/provenance.json';
import vocabulary from '../assets/data/vocab-core.json';
import { getCardAudio } from '@/api/endpoints/getCardAudio';
import { allWords, getScenes } from '@/data/scenes';
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

beforeEach(() => jest.clearAllMocks());

test('bundles a base64 MP3 for every sample word and exposes it in scenes', () => {
  const ids = vocabulary.words.map(word => word.id).sort();
  expect(ids).toHaveLength(200);
  expect(Object.keys(sampleAudio).sort()).toEqual(ids);
  expect(provenance.clip_count).toBe(200);
  expect(provenance.profile.provider).toBe('Amazon Polly');
  expect(provenance.profile.output_format).toBe('mp3');
  expect(provenance.profile.voice_id).toBe('Joanna');
  const audioById: Record<string, string> = sampleAudio;
  for (const word of allWords) {
    expect(word.audio).toBe(audioById[word.id]);
    expect(word.audio).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    const data = Buffer.from(word.audio!, 'base64');
    expect(data.length).toBeGreaterThan(128);
    expect(data.toString('base64')).toBe(word.audio);
    const offset =
      data.toString('ascii', 0, 3) === 'ID3'
        ? 10 + ((data[6] << 21) | (data[7] << 14) | (data[8] << 7) | data[9])
        : 0;
    expect(data[offset]).toBe(0xff);
    expect(data[offset + 1] & 0xe0).toBe(0xe0);
    expect((data[offset + 1] >> 3) & 3).not.toBe(1);
    expect((data[offset + 1] >> 1) & 3).not.toBe(0);
    expect([0, 15]).not.toContain(data[offset + 2] >> 4);
    expect((data[offset + 2] >> 2) & 3).not.toBe(3);
  }
  const sceneWords = getScenes('vi').flatMap(scene => scene.words);
  expect(sceneWords.map(word => word.id).sort()).toEqual(ids);
  expect(sceneWords.every(word => Boolean(word.audio))).toBe(true);
});

test('plays a bundled sample offline without an account or network request', async () => {
  let audio!: ReturnType<typeof useAudio>;
  const Harness = () => {
    audio = useAudio();
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AudioContext.Provider value={{ token: null, speed: 0.75, offline: true }}>
        <Harness />
      </AudioContext.Provider>,
    );
  });
  try {
    await ReactTestRenderer.act(async () => audio.play(allWords[0].audio));
    expect(getCardAudio).not.toHaveBeenCalled();
    expect(RNFS.writeFile).toHaveBeenCalledWith(
      expect.any(String),
      sampleAudio.notebook,
      'base64',
    );
    expect(mockSpeed).toHaveBeenCalledWith(0.75);
    expect(mockPlay).toHaveBeenCalledTimes(1);
  } finally {
    await ReactTestRenderer.act(async () => renderer.unmount());
  }
});
