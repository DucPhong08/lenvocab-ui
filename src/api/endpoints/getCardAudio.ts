import { request } from '@/api/client/request';

export const getCardAudio = (token: string, id: string) =>
  request<{ audio_base64: string }>(
    `/flashcards/${encodeURIComponent(id)}/audio`,
    {},
    token,
  );
