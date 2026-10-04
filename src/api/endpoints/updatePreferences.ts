import { request } from '@/api/client/request';
import type { UserPreferences, UserPreferencesResponse } from '@/api/contracts';

export type UpdatePreferencesPayload = Partial<UserPreferences>;

export const updatePreferences = (
  token: string,
  payload: UpdatePreferencesPayload,
) =>
  request<UserPreferencesResponse>(
    '/users/me/preferences',
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    token,
  );
