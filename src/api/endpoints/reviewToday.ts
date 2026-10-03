import { request } from '@/api/client/request';
import type { ReviewCard } from '@/api/contracts';

export const reviewToday = (token: string) =>
  request<ReviewCard[]>('/review/today', {}, token);

