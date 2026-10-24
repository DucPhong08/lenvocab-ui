import { json } from '@/api/client/json';
import { request } from '@/api/client/request';

export const authenticateGoogle = (idToken: string) =>
  request<{ access_token: string }>(
    '/auth/google',
    json({ id_token: idToken }),
  );

export const linkGoogle = (token: string, idToken: string) =>
  request<{ message: string }>(
    '/auth/google/link',
    json({ id_token: idToken }),
    token,
  );
