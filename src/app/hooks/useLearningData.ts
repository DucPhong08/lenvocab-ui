import { useCallback } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { ApiError } from '@/api/client/ApiError';
import { getMe } from '@/api/endpoints/getMe';
import { listFlashcards } from '@/api/endpoints/listFlashcards';
import { reviewToday } from '@/api/endpoints/reviewToday';
import type { FlashcardPage, SubmitReviewResponse } from '@/api/contracts';

export function useLearningData(
  token: string | null,
  onUnauthorized: () => Promise<unknown>,
) {
  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401)
        onUnauthorized().catch(() => {});
    },
    [onUnauthorized],
  );
  const config = { shouldRetryOnError: false, onError: handleError };
  const userQuery = useSWR(
    token ? ['me', token] : null,
    ([, authToken]) => getMe(authToken),
    config,
  );
  const cardsQuery = useSWRInfinite<FlashcardPage>(
    (index, previous: FlashcardPage | null) => {
      if (!token || (previous && previous.next_offset === null)) return null;
      return [
        'cards',
        token,
        index === 0 ? 0 : previous!.next_offset!,
      ] as const;
    },
    ([, authToken, offset]: readonly [string, string, number]) =>
      listFlashcards(authToken, offset),
    { ...config, revalidateFirstPage: false },
  );
  const dueQuery = useSWR(
    token ? ['due', token] : null,
    ([, authToken]) => reviewToday(authToken),
    config,
  );
  const pages = cardsQuery.data ?? [];
  const cards = [
    ...new Map(
      pages
        .flatMap(page => page.items)
        .map(card => [card.user_flashcard_id, card]),
    ).values(),
  ];
  const hasMoreCards =
    pages.length > 0 && pages[pages.length - 1].next_offset !== null;
  const loadingMoreCards = cardsQuery.isValidating;
  const loadMoreCards = async () => {
    if (!hasMoreCards || cardsQuery.isValidating) return;
    if (cardsQuery.error) {
      await cardsQuery.mutate();
      return;
    }
    await cardsQuery.setSize(cardsQuery.size + 1);
  };
  const error = userQuery.error ?? cardsQuery.error ?? dueQuery.error;
  const reloadData = async () => {
    await Promise.all([
      userQuery.mutate(),
      cardsQuery.mutate(),
      dueQuery.mutate(),
    ]);
  };
  const applyReview = async (result: SubmitReviewResponse) => {
    const updateCard = <T extends { user_flashcard_id: string }>(card: T) =>
      card.user_flashcard_id === result.user_flashcard_id
        ? {
            ...card,
            interval: result.interval_after,
            repetitions: result.repetitions_after,
            efactor: result.efactor_after,
            next_review_date: result.next_review_date,
          }
        : card;
    await Promise.all([
      cardsQuery.mutate(
        data =>
          data?.map(page => ({ ...page, items: page.items.map(updateCard) })),
        { revalidate: false },
      ),
      dueQuery.mutate(
        data =>
          data?.filter(
            card => card.user_flashcard_id !== result.user_flashcard_id,
          ),
        { revalidate: false },
      ),
    ]);
  };
  return {
    cards,
    totalSaved: pages[0]?.total ?? 0,
    hasMoreCards,
    loadingMoreCards,
    loadMoreCards,
    applyReview,
    dataError:
      error instanceof Error
        ? error.message
        : error
        ? 'Không thể tải dữ liệu học tập.'
        : null,
    due: dueQuery.data ?? [],
    loadingData:
      userQuery.isLoading || cardsQuery.isLoading || dueQuery.isLoading,
    reloadCards: cardsQuery.mutate,
    reloadData,
    reloadDue: dueQuery.mutate,
    reloadUser: userQuery.mutate,
    user: userQuery.data ?? null,
  };
}
