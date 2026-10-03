import { json } from '@/api/client/json';
import { request } from '@/api/client/request';

export function authenticate(
  mode: 'login' | 'register',
  email: string,
  password: string,
  name: string,
) {
  return request<{ access_token: string }>(
    `/auth/${mode}`,
    json({
      email: email.trim().toLowerCase(),
      password,
      ...(mode === 'register'
        ? { display_name: name.trim() || null }
        : {}),
    }),
  );
}

