import { ApiError } from './ApiError';
import { API_ORIGIN } from './config';
import { getApiErrorMessage } from './getApiErrorMessage';

export async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  let response: Response;
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    path.startsWith('/vision/scan') ? 120000 : 45000,
  );

  try {
    response = await fetch(`${API_ORIGIN}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (cause) {
    throw new ApiError(
      cause instanceof Error && cause.name === 'AbortError'
        ? 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.'
        : 'Không thể kết nối máy chủ. Kiểm tra mạng rồi thử lại.',
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(response.status, body?.detail),
      response.status,
    );
  }

  return body as T;
}
