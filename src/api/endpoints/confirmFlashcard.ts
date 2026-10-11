import { json } from '@/api/client/json';
import { ApiError } from '@/api/client/ApiError';
import { request } from '@/api/client/request';
import type { Flashcard, ScanResult } from '@/api/contracts';

export function confirmFlashcard(token: string, draft: ScanResult) {
  if (!draft.keyword) throw new ApiError('Thẻ nháp thiếu từ khóa để lưu.', 0);

  return request<Flashcard>(
    '/flashcards/confirm',
    json({ keyword: draft.keyword }),
    token,
  );
}
