import { request } from '@/api/client/request';
import type { FlashcardPage } from '@/api/contracts';

export const listFlashcards = (token: string, offset = 0) =>
  request<FlashcardPage>(
    `/flashcards/page?limit=30&offset=${offset}`,
    {},
    token,
  );
