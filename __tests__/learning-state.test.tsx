import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import type { Flashcard, ReviewCard, User } from '@/api/contracts';
import { useFlashcards } from '@/screens/learn/hooks/useFlashcards';
import { getWord } from '@/data/getWord';
import { allWords, type Word } from '@/data/scenes';
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
      renderer.update(<Harness cards={[flashcard('card-2', 'table')]} />);
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
      dataError: null,
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

test('a session keeps ten cards, then restarts with current remaining cards', async () => {
  const due = Array.from({ length: 12 }, (_, i) =>
    reviewCard(`card-${i}`, `word-${i}`),
  );
  const submitReview = jest.fn().mockResolvedValue(undefined);
  let state!: ReturnType<typeof useFlashcards>;
  const Harness = ({ remaining }: { remaining: ReviewCard[] }) => {
    state = useFlashcards({
      due: remaining,
      dataError: null,
      loadingData: false,
      submitReview,
      user,
    });
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Harness remaining={due} />);
  });
  try {
    expect(state.words).toHaveLength(10);
    for (let i = 0; i < 10; i++) {
      await ReactTestRenderer.act(async () => state.grade(5));
      await ReactTestRenderer.act(async () =>
        renderer.update(<Harness remaining={due.slice(i + 1)} />),
      );
    }
    expect(state.word).toBeUndefined();
    expect(submitReview.mock.calls.map(call => call[0])).toEqual(
      due.slice(0, 10).map(card => card.user_flashcard_id),
    );
    await ReactTestRenderer.act(async () => state.restart());
    expect(state.words.map(word => word.id)).toEqual(['card-10', 'card-11']);
    expect(state.index).toBe(0);
    expect(state.flipped).toBe(false);
  } finally {
    await ReactTestRenderer.act(async () => renderer.unmount());
  }
});

async function quizSession(
  overrides: Partial<Parameters<typeof useQuiz>[0]> = {},
) {
  let state!: ReturnType<typeof useQuiz>;
  const Harness = () => {
    state = useQuiz({
      cards: [],
      due: [],
      user,
      loadingData: false,
      dataError: null,
      scrollToEnd: jest.fn(),
      scrollToTop: jest.fn(),
      ...overrides,
    });
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Harness />);
  });
  return {
    get state() {
      return state;
    },
    close: async () => {
      await ReactTestRenderer.act(async () => renderer.unmount());
    },
  };
}

test('quiz removes distractors with the same meaning, including case, punctuation and aliases', async () => {
  const cards = [
    { ...flashcard('cup', 'cup'), meaning_vi: 'Cái cốc' },
    { ...flashcard('mug', 'mug'), meaning_vi: '  cái CỐC! ' },
    { ...flashcard('teacup', 'teacup'), meaning_vi: 'cái cốc, tách trà' },
  ];
  const session = await quizSession({ cards });
  try {
    expect(session.state.options.map(item => item.id)).not.toEqual(
      expect.arrayContaining(['mug']),
    );
    expect(session.state.options.map(item => item.id)).not.toContain('teacup');
    expect(session.state.options).toContainEqual(
      expect.objectContaining({ id: 'cup' }),
    );
  } finally {
    await session.close();
  }
});

test('a large quiz takes ten words and continues with the next group', async () => {
  const cards = Array.from({ length: 60 }, (_, i) =>
    flashcard(`card-${i}`, `word-${i}`),
  );
  const session = await quizSession({ cards });
  try {
    expect(session.state.questions.map(item => item.id)).toEqual(
      Array.from({ length: 10 }, (_, i) => `card-${i}`),
    );
    expect(session.state.remaining).toBe(50);
    await ReactTestRenderer.act(async () => session.state.more());
    expect(session.state.questions.map(item => item.id)).toEqual(
      Array.from({ length: 10 }, (_, i) => `card-${i + 10}`),
    );
    expect(session.state.remaining).toBe(40);
  } finally {
    await session.close();
  }
});

test('selected B2 samples work while account data is unavailable and never use personal cards', async () => {
  const practiceWords = ['keep-track-of', 'cut-down-on', 'allow-for'].map(
    getWord,
  );
  const session = await quizSession({
    practiceWords,
    cards: [flashcard('personal', 'cup')],
    loadingData: true,
    dataError: 'offline',
  });
  try {
    expect(session.state.questions).toEqual(practiceWords);
    expect(session.state.context?.word.id).toBe('keep-track-of');
    expect(session.state.context?.sentence).toContain('I ____ deadlines');
  } finally {
    await session.close();
  }
});

test('context task checks the learned phrase once and retry contains only missed words', async () => {
  const practiceWords = ['keep-track-of', 'cut-down-on', 'allow-for'].map(
    getWord,
  );
  const session = await quizSession({ practiceWords });
  try {
    const wrong = session.state.options.find(
      item => item.id !== session.state.word.id,
    )!;
    await ReactTestRenderer.act(async () =>
      session.state.selectOption(wrong.id),
    );
    await ReactTestRenderer.act(async () => session.state.nextQuestion());
    for (let i = 0; i < 2; i++) {
      await ReactTestRenderer.act(async () =>
        session.state.selectOption(session.state.word.id),
      );
      await ReactTestRenderer.act(async () => session.state.nextQuestion());
    }
    expect(session.state.isContext).toBe(true);
    expect(session.state.total).toBe(4);
    expect(session.state.done).toBe(false);
    await ReactTestRenderer.act(async () => {
      session.state.answerContext('  KEEP   TRACK OF  ');
      session.state.answerContext('keep track of');
    });
    expect(session.state.score).toBe(3);
    await ReactTestRenderer.act(async () => session.state.nextQuestion());
    expect(session.state.done).toBe(true);
    expect(session.state.missed.map(item => item.id)).toEqual([
      'keep-track-of',
    ]);
    await ReactTestRenderer.act(async () => session.state.retryMissed());
    expect(session.state.questions.map(item => item.id)).toEqual([
      'keep-track-of',
    ]);
    expect(session.state.score).toBe(0);
    expect(session.state.done).toBe(false);
  } finally {
    await session.close();
  }
});

test('context extraction does not hide a term inside another word or skip its first character', async () => {
  const word: Word = {
    ...getWord('mug'),
    id: 'pan',
    term: 'pan',
    example: 'We make pancakes.',
  };
  const session = await quizSession({ practiceWords: [word] });
  try {
    expect(session.state.context).toBeUndefined();
  } finally {
    await session.close();
  }
});

test('retry preserves the next group and a word missed twice appears once', async () => {
  const practiceWords = [
    getWord('keep-track-of'),
    ...allWords.filter(word => word.id !== 'keep-track-of'),
  ].slice(0, 11);
  const session = await quizSession({ practiceWords });
  try {
    const wrong = session.state.options.find(
      item => item.id !== session.state.word.id,
    )!;
    await ReactTestRenderer.act(async () =>
      session.state.selectOption(wrong.id),
    );
    await ReactTestRenderer.act(async () => session.state.nextQuestion());
    for (let i = 0; i < 9; i++) {
      await ReactTestRenderer.act(async () =>
        session.state.selectOption(session.state.word.id),
      );
      await ReactTestRenderer.act(async () => session.state.nextQuestion());
    }
    await ReactTestRenderer.act(async () =>
      session.state.answerContext('track'),
    );
    await ReactTestRenderer.act(async () => session.state.nextQuestion());
    expect(session.state.missed).toHaveLength(1);
    await ReactTestRenderer.act(async () => session.state.retryMissed());
    expect(session.state.remaining).toBe(1);
    await ReactTestRenderer.act(async () => session.state.more());
    expect(session.state.word.id).toBe(practiceWords[10].id);
  } finally {
    await session.close();
  }
});

test('context keeps the actual second example when the first has no exact term', async () => {
  const word = {
    ...getWord('mug'),
    term: 'mug (large)',
    example: 'A large cup.',
    example2: 'I use a mug (large) every day.',
  };
  const session = await quizSession({ practiceWords: [word] });
  try {
    expect(session.state.context?.sentence).toBe('I use a ____ every day.');
    expect(session.state.context?.example).toBe(word.example2);
  } finally {
    await session.close();
  }
});

test('quiz retains distinct hyphenated and unhyphenated terms', async () => {
  const word = getWord('mug');
  const session = await quizSession({
    practiceWords: [
      {
        ...word,
        id: 'carry-on',
        term: 'carry-on',
        meaning: 'hành lý xách tay',
      },
      { ...word, id: 'carry-on-verb', term: 'carry on', meaning: 'tiếp tục' },
    ],
  });
  try {
    expect(session.state.questions).toHaveLength(2);
  } finally {
    await session.close();
  }
});

test('context does not accept incorrect internal punctuation as the learned phrase', async () => {
  const session = await quizSession({
    practiceWords: [getWord('keep-track-of')],
  });
  try {
    await ReactTestRenderer.act(async () =>
      session.state.selectOption(session.state.word.id),
    );
    await ReactTestRenderer.act(async () => session.state.nextQuestion());
    await ReactTestRenderer.act(async () =>
      session.state.answerContext('keep-track-of'),
    );
    expect(session.state.score).toBe(1);
    expect(session.state.missed.map(word => word.id)).toEqual([
      'keep-track-of',
    ]);
  } finally {
    await session.close();
  }
});
