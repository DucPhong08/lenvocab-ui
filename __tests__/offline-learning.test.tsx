import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SWRConfig } from 'swr';
import { ApiError } from '@/api/client/ApiError';
import type { Flashcard, User } from '@/api/contracts';
import { getMe } from '@/api/endpoints/getMe';
import { listFlashcards } from '@/api/endpoints/listFlashcards';
import { reviewToday } from '@/api/endpoints/reviewToday';
import { gradeReview } from '@/api/endpoints/gradeReview';
import { useLearningData } from '@/app/hooks/useLearningData';
import { loadLearning } from '@/services/offline/storage';

jest.mock('react-native-fs');
jest.mock('@/api/endpoints/getMe', () => ({ getMe: jest.fn() }));
jest.mock('@/api/endpoints/listFlashcards', () => ({
  listFlashcards: jest.fn(),
}));
jest.mock('@/api/endpoints/reviewToday', () => ({ reviewToday: jest.fn() }));
jest.mock('@/api/endpoints/gradeReview', () => ({ gradeReview: jest.fn() }));
const files: Map<string, string> = jest.requireMock('react-native-fs').__files;
const key = '77777777-7777-4777-8777-777777777777';
const token = 'offline-test-token';
const user: User = {
  id: 'user-1',
  email: 'private@example.com',
  display_name: 'Learner',
  account_tier: 'FREE',
  daily_quota_left: 2,
  is_active: true,
  preferences: {
    preferred_voice_id: 'Joanna',
    voice_speed: 1,
    daily_review_goal: 15,
    target_language: 'vi',
    max_detected_objects: 5,
  },
};
const card: Flashcard = {
  user_flashcard_id: 'card-1',
  global_flashcard_id: 'word-1',
  status: 'CONFIRMED',
  keyword: 'cup',
  pronunciation: null,
  meaning_vi: 'cốc',
  example_1: 'A cup.',
  example_2: 'My cup.',
  related_words: [],
  audio_base64: 'private-audio',
  image_url: 'https://example.com/private?signature=secret',
  has_image: true,
  interval: 1,
  repetitions: 0,
  efactor: 2.5,
  next_review_date: '2026-11-07',
};
let learning: ReturnType<typeof useLearningData>;
let renderer: ReactTestRenderer.ReactTestRenderer | null;
const unauthorized = jest.fn().mockResolvedValue(false);
function Harness() {
  learning = useLearningData(token, unauthorized, key);
  return null;
}
async function open() {
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <Harness />
      </SWRConfig>,
    );
  });
  await act(async () => {
    await loadLearning(key);
  });
}
async function close() {
  await act(async () => {
    renderer?.unmount();
    renderer = null;
  });
}
function disconnect() {
  for (const request of [getMe, listFlashcards, reviewToday])
    jest.mocked(request).mockRejectedValue(new ApiError('offline', 0));
  jest.mocked(gradeReview).mockRejectedValue(new ApiError('offline', 0));
}
beforeEach(() => {
  files.clear();
  jest.clearAllMocks();
  jest.mocked(getMe).mockResolvedValue(user);
  jest
    .mocked(listFlashcards)
    .mockResolvedValue({ items: [card], total: 5, next_offset: null });
  jest.mocked(reviewToday).mockResolvedValue([card]);
});
afterEach(close);

test('cold starts recover downloaded text and pending grades, then persist the server schedule with the acknowledgment', async () => {
  await open();
  expect((await loadLearning(key))?.snapshot?.cards).toHaveLength(1);
  await close();
  disconnect();
  await open();
  expect(learning.usingCache).toBe(true);
  expect(learning.loadingData).toBe(false);
  expect(learning.dataError).toBeNull();
  expect(learning.cards[0]).toEqual(
    expect.objectContaining({
      keyword: 'cup',
      audio_base64: null,
      image_url: null,
    }),
  );
  expect(learning.totalSaved).toBe(5);
  expect(learning.cachedCount).toBe(1);
  await act(async () => {
    await learning.queueReview('card-1', 5, 'fixed-review-id');
  });
  expect(learning.due).toEqual([]);
  expect((await loadLearning(key))?.queue).toHaveLength(1);
  await close();
  await open();
  expect(learning.due).toEqual([]);
  expect(learning.reviewQueue[0].reviewId).toBe('fixed-review-id');
  jest
    .mocked(gradeReview)
    .mockResolvedValue({
      user_flashcard_id: 'card-1',
      interval_after: 6,
      repetitions_after: 2,
      efactor_after: 2.6,
      next_review_date: '2026-11-13',
      message: 'saved',
    });
  await act(async () => {
    await learning.syncReviews();
  });
  expect(learning.reviewQueue).toEqual([]);
  expect(learning.cards[0].interval).toBe(6);
  await close();
  await open();
  expect(learning.due).toEqual([]);
  expect(learning.cards[0].next_review_date).toBe('2026-11-13');
  expect(
    jest
      .mocked(gradeReview)
      .mock.calls.every(args => args[3] === 'fixed-review-id'),
  ).toBe(true);
  const text = [...files.values()].join('');
  for (const privateValue of [
    token,
    user.email!,
    'signature=secret',
    'private-audio',
  ])
    expect(text).not.toContain(privateValue);
});

test('an authorization failure cannot fall back to a cached private library', async () => {
  await open();
  await close();
  disconnect();
  jest.mocked(getMe).mockRejectedValue(new ApiError('expired', 401));
  await open();
  expect(unauthorized).toHaveBeenCalled();
  expect(learning.usingCache).toBe(false);
  expect(learning.cards).toEqual([]);
  expect(learning.user).toBeNull();
  expect(learning.dataError).toBe('expired');
});
