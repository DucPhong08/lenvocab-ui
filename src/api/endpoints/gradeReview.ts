import { json } from '@/api/client/json';
import { request } from '@/api/client/request';
import type { SubmitReviewResponse } from '@/api/contracts';

export const gradeReview = (
  token: string,
  id: string,
  quality: number,
  reviewId: string,
) =>
  request<SubmitReviewResponse>(
    `/review/${encodeURIComponent(id)}`,
    json({ quality, review_id: reviewId }),
    token,
  );
