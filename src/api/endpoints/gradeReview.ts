import { json } from '@/api/client/json';
import { request } from '@/api/client/request';

export const gradeReview = (token: string, id: string, quality: number) =>
  request(`/review/${encodeURIComponent(id)}`, json({ quality }), token);

