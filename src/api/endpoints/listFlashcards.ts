import { request } from '@/api/client/request';
import type { Flashcard } from '@/api/contracts';

export const listFlashcards = (token: string) =>
  request<Flashcard[]>('/flashcards', {}, token);

