import type { Word } from '@/data/scenes';
import type { Flashcard, ReviewCard } from '@/api/contracts';

export function cardWord(card: Flashcard | ReviewCard): Word {
  return {
    id: card.user_flashcard_id,
    term: card.keyword,
    ipa: card.pronunciation ?? '',
    type: 'từ vựng',
    meaning: card.meaning_vi,
    example: card.example_1,
    example2: card.example_2,
    note: card.related_words?.length
      ? `Từ liên quan: ${card.related_words.join(', ')}`
      : 'Ôn lại để ghi nhớ từ này.',
    level: 'status' in card ? card.status : 'Đến hạn',
    scene: 'desk',
    audio: card.audio_base64 ?? null,
    interval: card.interval,
    repetitions: card.repetitions,
    nextReviewDate: card.next_review_date,
  };
}
