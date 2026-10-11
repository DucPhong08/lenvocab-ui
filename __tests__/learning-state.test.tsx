import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import type { Flashcard, ReviewCard, User } from '@/api/contracts';
import { useFlashcards } from '@/screens/learn/hooks/useFlashcards';
import { useQuiz } from '@/screens/learn/hooks/useQuiz';

const user: User = {
  id: 'user-1',
  email: 'learner@example.com',
  display_name: 'Learner',
  account_tier: 'FREE',
  daily_quota_left: 3,
  is_active: true,
  preferences: {
    preferred_voice_id: 'Joanna',
    voice_speed: 1,
    daily_review_goal: 15,
    target_language: 'vi',
    max_detected_objects: 5,
  },
};

function reviewCard(id: string, keyword: string): ReviewCard {
  return {
    user_flashcard_id: id,
    keyword,
    pronunciation: null,
    meaning_vi: `nghĩa ${keyword}`,
    example_1: `${keyword} example one`,
    example_2: `${keyword} example two`,
    related_words: [],
    audio_base64: null,
    interval: 1,
    repetitions: 0,
    efactor: 2.5,
    next_review_date: '2026-10-11',
  };
}

function flashcard(id: string, keyword: string): Flashcard {
  return {
    ...reviewCard(id, keyword),
    global_flashcard_id: `global-${id}`,
    status: 'CONFIRMED',
  };
}

test('quiz keeps its snapshot during refetch, shuffles once, and scores one rapid answer', async () => {
  const random = jest.spyOn(Math, 'random').mockReturnValue(0);
  let state!: ReturnType<typeof useQuiz>;
  const Harness = ({ cards }: { cards: Flashcard[] }) => {
    state = useQuiz({
      cards,
      dataError: null,
      due: [],
      loadingData: false,
      scrollToEnd: jest.fn(),
      scrollToTop: jest.fn(),
      user,
    });
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  try {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Harness cards={[flashcard('card-1', 'chair')]} />,
      );
    });
    const firstQuestion = state.word.id;
    expect(state.options).toHaveLength(4);
    expect(state.options[0].id).not.toBe(firstQuestion);

    await ReactTestRenderer.act(async () => {
      renderer.update(
        <Harness cards={[flashcard('card-2', 'table')]} />,
      );
    });
    expect(state.word.id).toBe(firstQuestion);

    await ReactTestRenderer.act(async () => {
      state.selectOption(firstQuestion);
      state.selectOption(firstQuestion);
    });
    expect(state.score).toBe(1);

    await ReactTestRenderer.act(async () => state.restart());
    expect(state.word.id).toBe('card-2');
  } finally {
    random.mockRestore();
    await ReactTestRenderer.act(async () => renderer?.unmount());
  }
});

test('flashcard grading blocks duplicate submits and keeps review_id for retry', async () => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(Math, 'random').mockReturnValue(0.25);
  const submitReview = jest
    .fn<Promise<void>, [string, number, string]>()
    .mockRejectedValueOnce(new Error('timeout'))
    .mockResolvedValueOnce(undefined);
  let state!: ReturnType<typeof useFlashcards>;
  const Harness = () => {
    state = useFlashcards({
      due: [reviewCard('card-1', 'chair')],
      loadingData: false,
      submitReview,
      user,
    });
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Harness />);
  });

  await ReactTestRenderer.act(async () => {
    const first = state.grade(4);
    const duplicate = state.grade(4);
    await Promise.all([first, duplicate]);
  });
  expect(submitReview).toHaveBeenCalledTimes(1);
  const reviewId = submitReview.mock.calls[0][2];
  expect(reviewId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );

  await ReactTestRenderer.act(async () => state.grade(2));
  expect(submitReview).toHaveBeenCalledTimes(2);
  expect(submitReview.mock.calls[1][1]).toBe(4);
  expect(submitReview.mock.calls[1][2]).toBe(reviewId);
  await ReactTestRenderer.act(async () => renderer.unmount());
});
