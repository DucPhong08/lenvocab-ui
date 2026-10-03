import { request } from '@/api/client/request';
import type { User } from '@/api/contracts';

export const getMe = (token: string) =>
  request<User>('/auth/me', {}, token);

