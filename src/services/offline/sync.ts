import { ApiError } from '@/api/client/ApiError';
import { gradeReview } from '@/api/endpoints/gradeReview';
import type { SubmitReviewResponse } from '@/api/contracts';
import { errorMessage } from '@/utils/errorMessage';
import { loadLearning, updateLearning, type OfflineData } from './storage';

const requests = new Map<string, Promise<void>>();

export function syncLearning({
  sessionKey,
  token,
  isCurrent,
  onReview,
  onChange,
  onUnauthorized,
}: {
  sessionKey: string;
  token: string;
  isCurrent: () => boolean;
  onReview: (result: SubmitReviewResponse) => Promise<void>;
  onChange: (data: OfflineData) => void;
  onUnauthorized: () => Promise<unknown>;
}) {
  const active = requests.get(sessionKey);
  if (active) return active;
  const run = async () => {
    while (isCurrent()) {
      const data = await loadLearning(sessionKey);
      const item = data?.queue.find(attempt => !attempt.error);
      if (!item || !isCurrent()) return;
      try {
        const result = await gradeReview(
          token,
          item.cardId,
          item.quality,
          item.reviewId,
        );
        if (!isCurrent()) return;
        await onReview(result);
        if (!isCurrent()) return;
        const next = await updateLearning(sessionKey, current => ({
          ...current,
          queue: current.queue.filter(
            attempt => attempt.reviewId !== item.reviewId,
          ),
          snapshot: current.snapshot && {
            ...current.snapshot,
            cards: current.snapshot.cards.map(card =>
              card.user_flashcard_id === result.user_flashcard_id
                ? {
                    ...card,
                    interval: result.interval_after,
                    repetitions: result.repetitions_after,
                    efactor: result.efactor_after,
                    next_review_date: result.next_review_date,
                  }
                : card,
            ),
            due: current.snapshot.due.filter(
              card => card.user_flashcard_id !== result.user_flashcard_id,
            ),
          },
        }));
        if (isCurrent()) onChange(next);
      } catch (cause) {
        if (!isCurrent()) return;
        if (cause instanceof ApiError && cause.status === 401) {
          await onUnauthorized();
          return;
        }
        if (
          !(cause instanceof ApiError) ||
          cause.status < 400 ||
          cause.status === 429 ||
          cause.status >= 500
        )
          throw cause;
        const next = await updateLearning(sessionKey, current => ({
          ...current,
          queue: current.queue.map(attempt =>
            attempt.reviewId === item.reviewId
              ? { ...attempt, error: errorMessage(cause) }
              : attempt,
          ),
        }));
        if (isCurrent()) onChange(next);
      }
    }
  };
  const job = run().finally(() => {
    if (requests.get(sessionKey) === job) requests.delete(sessionKey);
  });
  requests.set(sessionKey, job);
  return job;
}
