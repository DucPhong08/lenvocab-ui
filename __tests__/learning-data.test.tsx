import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SWRConfig } from 'swr';
import type { Flashcard, ReviewCard, User } from '@/api/contracts';
import { useLearningData } from '@/app/hooks/useLearningData';

const mockGetMe = jest.fn();
const mockListFlashcards = jest.fn();
const mockReviewToday = jest.fn();

jest.mock('@/api/endpoints/getMe', () => ({
  getMe: (...args: unknown[]) => mockGetMe(...args),
}));
jest.mock('@/api/endpoints/listFlashcards', () => ({
  listFlashcards: (...args: unknown[]) => mockListFlashcards(...args),
}));
jest.mock('@/api/endpoints/reviewToday', () => ({
  reviewToday: (...args: unknown[]) => mockReviewToday(...args),
}));

const user: User = {
  id: 'user-1',
  email: 'learner@example.com',
  display_name: null,
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

const dueCard: ReviewCard = {
  user_flashcard_id: 'card-1',
  keyword: 'chair',
  pronunciation: null,
  meaning_vi: 'cái ghế',
  example_1: 'This is a chair.',
  example_2: 'The chair is blue.',
  related_words: [],
  audio_base64: null,
  interval: 1,
  repetitions: 0,
  efactor: 2.5,
  next_review_date: '2026-10-11',
};

test('applies a review response to both SWR caches without refetching', async () => {
  jest.useFakeTimers();
  const card: Flashcard = {
    ...dueCard,
    global_flashcard_id: 'global-1',
    status: 'CONFIRMED',
  };
  mockGetMe.mockResolvedValue(user);
  mockListFlashcards.mockResolvedValue([card]);
  mockReviewToday.mockResolvedValue([dueCard]);
  let learning!: ReturnType<typeof useLearningData>;
  const Harness = () => {
    learning = useLearningData('token', jest.fn());
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <Harness />
      </SWRConfig>,
    );
  });
  expect(learning.cards).toHaveLength(1);
  expect(learning.due).toHaveLength(1);

  await ReactTestRenderer.act(async () => {
    await learning.applyReview({
      user_flashcard_id: 'card-1',
      interval_after: 6,
      repetitions_after: 2,
      efactor_after: 2.6,
      next_review_date: '2026-10-17',
      message: 'saved',
    });
  });

  expect(learning.cards[0]).toEqual(
    expect.objectContaining({
      interval: 6,
      repetitions: 2,
      efactor: 2.6,
      next_review_date: '2026-10-17',
    }),
  );
  expect(learning.due).toEqual([]);
  expect(mockListFlashcards).toHaveBeenCalledTimes(1);
  expect(mockReviewToday).toHaveBeenCalledTimes(1);
  await ReactTestRenderer.act(async () => renderer.unmount());
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
