import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SWRConfig } from 'swr';
import { useLearningData } from '@/app/hooks/useLearningData';
import { listFlashcards } from '@/api/endpoints/listFlashcards';
import { reviewToday } from '@/api/endpoints/reviewToday';
import { getMe } from '@/api/endpoints/getMe';
import type { Flashcard, User } from '@/api/contracts';
jest.mock('@/api/endpoints/listFlashcards', () => ({
  listFlashcards: jest.fn(),
}));
jest.mock('@/api/endpoints/reviewToday', () => ({ reviewToday: jest.fn() }));
jest.mock('@/api/endpoints/getMe', () => ({ getMe: jest.fn() }));
const card: Flashcard = {
  user_flashcard_id: 'one',
  global_flashcard_id: 'global',
  keyword: 'cup',
  pronunciation: null,
  meaning_vi: 'cốc',
  example_1: 'A',
  example_2: 'B',
  related_words: [],
  audio_base64: null,
  status: 'CONFIRMED',
  interval: 1,
  repetitions: 0,
  efactor: 2.5,
  next_review_date: '2026-10-25',
};
beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(listFlashcards)
    .mockResolvedValue({ items: [card], total: 100, next_offset: 50 });
  jest.mocked(reviewToday).mockResolvedValue([card]);
  jest.mocked(getMe).mockResolvedValue({ id: 'user' } as User);
});
async function mount() {
  let data!: ReturnType<typeof useLearningData>;
  const cache = new Map();
  const Harness = ({ token }: { token: string }) => {
    data = useLearningData(token, jest.fn());
    return null;
  };
  const app = (token: string) => (
    <SWRConfig value={{ provider: () => cache, dedupingInterval: 0 }}>
      <Harness token={token} />
    </SWRConfig>
  );
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(app('first'));
  });
  return { get: () => data, renderer, app };
}
test('updates the owned card and its due image immediately without refetching', async () => {
  const h = await mount();
  try {
    expect(h.get().cards).toHaveLength(1);
    const updated = {
      ...card,
      image_url: 'new-private-sticker',
      has_image: true,
      image_style: 'sticker' as const,
    };
    await ReactTestRenderer.act(async () => h.get().applyCard(updated));
    expect(h.get().cards[0].image_url).toBe('new-private-sticker');
    expect(h.get().due[0].image_url).toBe('new-private-sticker');
    expect(h.get().totalSaved).toBe(100);
    expect(listFlashcards).toHaveBeenCalledTimes(1);
    expect(reviewToday).toHaveBeenCalledTimes(1);
  } finally {
    await ReactTestRenderer.act(async () => h.renderer.unmount());
  }
});
test('shows a new card while preserving server pagination and avoiding guessed totals', async () => {
  const h = await mount();
  try {
    await ReactTestRenderer.act(async () =>
      h.get().applyCard({ ...card, user_flashcard_id: 'new', keyword: 'book' }),
    );
    expect(h.get().cards.map(item => item.user_flashcard_id)).toEqual([
      'new',
      'one',
    ]);
    expect(h.get().totalSaved).toBe(100);
    expect(h.get().due.map(item => item.user_flashcard_id)).toEqual(['one']);
    await ReactTestRenderer.act(async () => h.get().loadMoreCards());
    expect(listFlashcards).toHaveBeenLastCalledWith('first', 50);
    await ReactTestRenderer.act(async () => h.renderer.update(h.app('second')));
    expect(h.get().cards.some(item => item.user_flashcard_id === 'new')).toBe(
      false,
    );
  } finally {
    await ReactTestRenderer.act(async () => h.renderer.unmount());
  }
});

test('keeps a newly saved card visible when the first page has never loaded', async () => {
  jest.mocked(listFlashcards).mockRejectedValue(new Error('offline'));
  const h = await mount();
  try {
    await ReactTestRenderer.act(async () => h.get().applyCard(card));
    expect(h.get().cards.map(item => item.user_flashcard_id)).toEqual(['one']);
    expect(h.get().totalSaved).toBe(0);
    jest
      .mocked(listFlashcards)
      .mockResolvedValue({ items: [card], total: 10, next_offset: 1 });
    await ReactTestRenderer.act(async () => {
      await h.get().reloadCards();
    });
    expect(h.get().cards.map(item => item.user_flashcard_id)).toEqual(['one']);
    expect(h.get().totalSaved).toBe(10);
    await ReactTestRenderer.act(async () => h.renderer.update(h.app('second')));
    expect(listFlashcards).toHaveBeenLastCalledWith('second', 0);
  } finally {
    await ReactTestRenderer.act(async () => h.renderer.unmount());
  }
});

test('does not expose pending cards to another account or revive them after logout', async () => {
  jest.mocked(listFlashcards).mockRejectedValue(new Error('offline'));
  const h = await mount();
  try {
    await ReactTestRenderer.act(async () => h.get().applyCard(card));
    await ReactTestRenderer.act(async () => h.renderer.update(h.app('second')));
    expect(h.get().cards).toEqual([]);
    await ReactTestRenderer.act(async () => h.renderer.update(h.app('first')));
    expect(h.get().cards).toEqual([]);
  } finally {
    await ReactTestRenderer.act(async () => h.renderer.unmount());
  }
});

test('an older first-page response cannot overwrite a newly saved image', async () => {
  let complete!: (value: {
    items: Flashcard[];
    total: number;
    next_offset: null;
  }) => void;
  jest.mocked(listFlashcards).mockReturnValueOnce(
    new Promise(resolve => {
      complete = resolve;
    }),
  );
  const h = await mount();
  const updated = {
    ...card,
    image_url: 'https://private.example/new-sticker',
    has_image: true,
  };
  try {
    await ReactTestRenderer.act(async () => h.get().applyCard(updated));
    expect(h.get().cards[0].image_url).toBe(updated.image_url);
    await ReactTestRenderer.act(async () =>
      complete({
        items: [{ ...card, image_url: 'https://private.example/old' }],
        total: 1,
        next_offset: null,
      }),
    );
    expect(h.get().cards[0].image_url).toBe(updated.image_url);
  } finally {
    await ReactTestRenderer.act(async () => h.renderer.unmount());
  }
});

test('reviews also update a pending saved card before its library page arrives', async () => {
  jest.mocked(listFlashcards).mockRejectedValue(new Error('offline'));
  const h = await mount();
  try {
    await ReactTestRenderer.act(async () => h.get().applyCard(card));
    await ReactTestRenderer.act(async () =>
      h
        .get()
        .applyReview({
          user_flashcard_id: card.user_flashcard_id,
          interval_after: 6,
          repetitions_after: 2,
          efactor_after: 2.6,
          next_review_date: '2026-11-01',
          message: 'saved',
        }),
    );
    expect(h.get().cards[0]).toEqual(
      expect.objectContaining({ interval: 6, repetitions: 2 }),
    );
    expect(h.get().due).toEqual([]);
  } finally {
    await ReactTestRenderer.act(async () => h.renderer.unmount());
  }
});
