import RNFS from 'react-native-fs';
import {
  clearLearning,
  loadLearning,
  updateLearning,
} from '@/services/offline/storage';
import type { Flashcard, User } from '@/api/contracts';

const mockFiles = new Map<string, string>();
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/private',
  mkdir: jest.fn().mockResolvedValue(undefined),
  exists: jest.fn(async (path: string) => mockFiles.has(path)),
  readFile: jest.fn(async (path: string) => {
    if (!mockFiles.has(path)) throw new Error('missing');
    return mockFiles.get(path)!;
  }),
  writeFile: jest.fn(async (path: string, text: string) => {
    mockFiles.set(path, text);
  }),
  unlink: jest.fn(async (path: string) => {
    mockFiles.delete(path);
  }),
}));
const key = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const card: Flashcard = {
  user_flashcard_id: 'card-1',
  global_flashcard_id: 'global-1',
  keyword: 'cup',
  pronunciation: null,
  meaning_vi: 'cốc',
  example_1: 'A cup.',
  example_2: 'My cup.',
  related_words: [],
  audio_base64: 'private-audio',
  status: 'CONFIRMED',
  interval: 1,
  repetitions: 0,
  efactor: 2.5,
  next_review_date: '2026-11-07',
  image_url: 'https://private.example/image?signature=secret',
  has_image: true,
};
const user = {
  id: 'user-1',
  email: 'private@example.com',
  display_name: 'Learner',
  preferences: {
    daily_review_goal: 15,
    animations_enabled: false,
    sound_effects_enabled: false,
  },
  scan_settings: {
    max_detected_objects: 8,
    max_allowed_objects: 10,
    confidence_threshold: 0.7,
  },
  preference_limits: {
    allowed_speeds: [1, 1.25],
    allowed_voices: ['Joanna'],
    allow_neural_voice: false,
    max_daily_review_goal: 20,
  },
} as User;
beforeEach(() => {
  mockFiles.clear();
  jest.clearAllMocks();
});

test('offline data survives reopening and omits email, audio, signed image links and tokens', async () => {
  await updateLearning(key, data => ({
    ...data,
    snapshot: {
      user,
      cards: [card],
      due: [card],
      total: 10,
      savedAt: '2026-11-07T00:00:00Z',
    },
  }));
  const loaded = await loadLearning(key);
  expect(loaded?.snapshot?.cards[0].keyword).toBe('cup');
  expect(loaded?.snapshot?.total).toBe(10);
  expect(loaded?.snapshot?.user.preferences.animations_enabled).toBe(false);
  expect(loaded?.snapshot?.user.preferences.sound_effects_enabled).toBe(false);
  expect(loaded?.snapshot?.user.scan_settings).toEqual(user.scan_settings);
  expect(loaded?.snapshot?.user.preference_limits).toEqual(
    user.preference_limits,
  );
  const disk = [...mockFiles.values()].join('');
  expect(disk).not.toContain('private@example.com');
  expect(disk).not.toContain('private-audio');
  expect(disk).not.toContain('signature=secret');
  expect(await loadLearning(other)).toBeNull();
});

test('a damaged latest slot falls back to the previous complete record', async () => {
  await updateLearning(key, data => ({
    ...data,
    queue: [
      {
        cardId: 'card-1',
        reviewId: 'r1',
        quality: 5,
        createdAt: '2026-11-07T00:00:00Z',
      },
    ],
  }));
  await updateLearning(key, data => ({
    ...data,
    queue: [
      ...data.queue,
      {
        cardId: 'card-2',
        reviewId: 'r2',
        quality: 3,
        createdAt: '2026-11-07T00:01:00Z',
      },
    ],
  }));
  const latest = [...mockFiles.entries()].find(
    ([, value]) => JSON.parse(value).revision === 2,
  )!;
  mockFiles.set(latest[0], '{broken');
  expect((await loadLearning(key))?.queue.map(item => item.reviewId)).toEqual([
    'r1',
  ]);
});

test('concurrent writes preserve all review IDs and a failed write rejects instead of pretending to save', async () => {
  await Promise.all(
    ['r1', 'r2'].map((reviewId, i) =>
      updateLearning(key, data => ({
        ...data,
        queue: [
          ...data.queue,
          {
            cardId: `card-${i}`,
            reviewId,
            quality: 5,
            createdAt: '2026-11-07T00:00:00Z',
          },
        ],
      })),
    ),
  );
  expect((await loadLearning(key))?.queue).toHaveLength(2);
  jest.mocked(RNFS.writeFile).mockRejectedValueOnce(new Error('disk full'));
  await expect(
    updateLearning(key, data => ({ ...data, queue: [] })),
  ).rejects.toThrow('disk full');
  expect((await loadLearning(key))?.queue).toHaveLength(2);
});

test('logout removes both slots and prevents a late response from recreating them', async () => {
  const logoutKey = '33333333-3333-4333-8333-333333333333';
  await updateLearning(logoutKey, data => data);
  await clearLearning(logoutKey);
  expect([...mockFiles.keys()].some(path => path.includes(logoutKey))).toBe(
    false,
  );
  await expect(updateLearning(logoutKey, data => data)).rejects.toThrow();
  expect(await loadLearning(logoutKey)).toBeNull();
});

test('invalid paths and snapshots claiming a different session are rejected', async () => {
  await expect(updateLearning('../other', data => data)).rejects.toThrow();
  await updateLearning(key, data => data);
  const [path, text] = [...mockFiles.entries()][0];
  mockFiles.set(
    path,
    JSON.stringify({ ...JSON.parse(text), sessionKey: other }),
  );
  expect(await loadLearning(key)).toBeNull();
});
