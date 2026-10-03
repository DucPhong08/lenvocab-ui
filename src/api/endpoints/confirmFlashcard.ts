import { json } from '@/api/client/json';
import { ApiError } from '@/api/client/ApiError';
import { request } from '@/api/client/request';
import type { Flashcard, ScanResult } from '@/api/contracts';

export function confirmFlashcard(token: string, draft: ScanResult) {
  if (
    !draft.keyword ||
    !draft.meaning_vi ||
    !draft.example_1 ||
    !draft.example_2
  ) {
    throw new ApiError('Thẻ nháp thiếu nội dung để lưu.', 0);
  }

  return request<Flashcard>(
    '/flashcards/confirm',
    json({
      keyword: draft.keyword,
      pronunciation: draft.pronunciation,
      meaning_vi: draft.meaning_vi,
      example_1: draft.example_1,
      example_2: draft.example_2,
      related_words: draft.related_words ?? [],
      audio_base64: draft.audio_base64,
    }),
    token,
  );
}

