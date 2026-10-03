import type { Word } from '@/data/scenes';
import type { Flashcard } from '@/api/contracts';

export function cardWord(card: Flashcard): Word {
  return {
    id: card.user_flashcard_id,
    term: card.keyword,
    ipa: card.pronunciation ?? '',
    type: 'từ vựng',
    meaning: card.meaning_vi,
    example: card.example_1,
    translation: card.example_2,
    note: card.related_words?.length
      ? `Từ liên quan: ${card.related_words.join(', ')}`
      : 'Ôn lại để ghi nhớ từ này.',
    level: card.status ?? 'Đã lưu',
    scene: 'desk',
  };
}

