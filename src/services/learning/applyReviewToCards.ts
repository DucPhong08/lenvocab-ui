import type { Flashcard, SubmitReviewResponse } from '@/api/contracts';

export function applyReviewToCards(
  cards: Flashcard[],
  result: SubmitReviewResponse,
): Flashcard[] {
  return cards.map(card => {
    if (card.user_flashcard_id !== result.user_flashcard_id) return card;
    return {
      ...card,
      interval: result.interval_after,
      repetitions: result.repetitions_after,
      efactor: result.efactor_after,
      next_review_date: result.next_review_date,
    };
  });
}
