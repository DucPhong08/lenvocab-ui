import { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { ApiError } from '@/api/client/ApiError';
import { getMe } from '@/api/endpoints/getMe';
import { listFlashcards } from '@/api/endpoints/listFlashcards';
import { reviewToday } from '@/api/endpoints/reviewToday';
import type {
  Flashcard,
  FlashcardPage,
  SubmitReviewResponse,
} from '@/api/contracts';

export function useLearningData(
  token: string | null,
  onUnauthorized: () => Promise<unknown>,
) {
  const [pending, setPending] = useState<{
    token: string;
    cards: Flashcard[];
  } | null>(null);
  const currentToken = useRef(token);
  currentToken.current = token;
  useEffect(() => {
    setPending(null);
  }, [token]);
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
  const serverCards = [
    ...new Map(
      pages
        .flatMap(page => page.items)
        .map(card => [card.user_flashcard_id, card]),
    ).values(),
  ];
  const pendingCards = pending?.token === token ? pending.cards : [];
  const serverIds = new Set(serverCards.map(card => card.user_flashcard_id));
  const cards = [
    ...pendingCards.filter(card => !serverIds.has(card.user_flashcard_id)),
    ...serverCards,
  ];
  useEffect(() => {
    const ids = new Set(
      cardsQuery.data?.flatMap(page =>
        page.items.map(card => card.user_flashcard_id),
      ),
    );
    setPending(current => {
      if (!current || current.token !== token) return null;
      const remaining = current.cards.filter(
        card => !ids.has(card.user_flashcard_id),
      );
      return remaining.length === current.cards.length
        ? current
        : { ...current, cards: remaining };
    });
  }, [cardsQuery.data, token]);
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
  const applyCard = async (card: Flashcard) => {
    if (!token || currentToken.current !== token) return;
    // Keep an overlay when there is no server page yet. Never fabricate totals/cursors.
    if (!cardsQuery.data?.length)
      setPending(current => ({
        token,
        cards: [
          card,
          ...(current?.token === token ? current.cards : []).filter(
            item => item.user_flashcard_id !== card.user_flashcard_id,
          ),
        ],
      }));
    // Mutate the server-backed caches immediately; keep server totals/cursors
    // until revalidation, since this card may already exist on an unloaded page.
    await Promise.all([
      cardsQuery.mutate(
        data => {
          if (!data?.length) return data;
          const exists = data.some(page =>
            page.items.some(
              item => item.user_flashcard_id === card.user_flashcard_id,
            ),
          );
          return data.map((page, index) => ({
            ...page,
            items:
              !exists && index === 0
                ? [card, ...page.items]
                : page.items.map(item =>
                    item.user_flashcard_id === card.user_flashcard_id
                      ? card
                      : item,
                  ),
          }));
        },
        { revalidate: false },
      ),
      dueQuery.mutate(
        data =>
          data?.map(item =>
            item.user_flashcard_id === card.user_flashcard_id
              ? { ...item, ...card }
              : item,
          ),
        { revalidate: false },
      ),
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
    setPending(current =>
      current?.token === token
        ? { ...current, cards: current.cards.map(updateCard) }
        : current,
    );
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
    applyCard,
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
