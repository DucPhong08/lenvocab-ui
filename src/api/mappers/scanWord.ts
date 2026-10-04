import type { Word } from '@/data/scenes';
import type { ScanResult } from '@/api/contracts';

export function scanWord(result: ScanResult): Word {
  return {
    id: `scan:${result.keyword ?? 'unknown'}`,
    term: result.keyword ?? 'Chưa nhận diện',
    ipa: result.pronunciation ?? '',
    type: 'từ vựng',
    meaning: result.meaning_vi ?? '',
    example: result.example_1 ?? '',
    example2: result.example_2 ?? '',
    note: result.related_words?.length
      ? `Từ liên quan: ${result.related_words.join(', ')}`
      : 'Học từ này qua ngữ cảnh trong ảnh của bạn.',
    level: 'AI',
    scene: 'desk',
    audio: result.audio_base64 ?? null,
  };
}
