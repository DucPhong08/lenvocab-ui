import { request } from '@/api/client/request';
import type { UserPreferencesResponse } from '@/api/contracts';

export const getPreferences = (token: string) =>
  request<UserPreferencesResponse>('/users/me/preferences', {}, token);
