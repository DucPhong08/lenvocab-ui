import { json } from '@/api/client/json';
import { request } from '@/api/client/request';

export function authenticate(
  mode: 'login' | 'register',
  username: string,
  password: string,
  name: string,
  email?: string,
) {
  return request<{ access_token: string }>(
    `/auth/${mode}`,
    json({
      username: username.trim().toLowerCase(),
      password,
      ...(mode === 'register'
        ? {
            display_name: name.trim() || null,
            email: email?.trim().toLowerCase() || null,
          }
        : {}),
    }),
  );
}
