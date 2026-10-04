import { useCallback } from 'react';
import useSWR from 'swr';
import { ApiError } from '@/api/client/ApiError';
import { getMe } from '@/api/endpoints/getMe';
import { listFlashcards } from '@/api/endpoints/listFlashcards';
import { reviewToday } from '@/api/endpoints/reviewToday';

export function useLearningData(
  token: string | null,
  onUnauthorized: () => Promise<unknown>,
) {
  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized().catch(() => {});
      }
    },
    [onUnauthorized],
  );

  const userQuery = useSWR(
    token ? ['me', token] : null,
    ([, authToken]) => getMe(authToken),
    { shouldRetryOnError: false, onError: handleError },
  );
  const cardsQuery = useSWR(
    token ? ['cards', token] : null,
    ([, authToken]) => listFlashcards(authToken),
    { shouldRetryOnError: false, onError: handleError },
  );
  const dueQuery = useSWR(
    token ? ['due', token] : null,
    ([, authToken]) => reviewToday(authToken),
    { shouldRetryOnError: false, onError: handleError },
  );

  const error = userQuery.error ?? cardsQuery.error ?? dueQuery.error;
  const reloadData = async () => {
    await Promise.all([
      userQuery.mutate(),
      cardsQuery.mutate(),
      dueQuery.mutate(),
    ]);
  };

  return {
    cards: cardsQuery.data ?? [],
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
