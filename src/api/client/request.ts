import { ApiError } from './ApiError';
import { API_ORIGIN } from './config';
import { getApiErrorMessage } from './getApiErrorMessage';

export async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    path.startsWith('/vision/scan') ? 120000 : 45000,
  );

  try {
    const response = await fetch(`${API_ORIGIN}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    let body: unknown;
    try {
      body = await response.json();
    } catch (cause) {
      if (controller.signal.aborted) throw cause;
      if (response.ok) {
        throw new ApiError('Máy chủ trả về dữ liệu không hợp lệ.', 0);
      }
      body = null;
    }

    if (!response.ok) {
      const detail =
        typeof body === 'object' && body !== null && 'detail' in body
          ? body.detail
          : null;
      throw new ApiError(
        getApiErrorMessage(response.status, detail),
        response.status,
      );
    }

    if (body === null) {
      throw new ApiError('Máy chủ trả về dữ liệu không hợp lệ.', 0);
    }

    return body as T;
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    throw new ApiError(
      controller.signal.aborted ||
        (cause instanceof Error && cause.name === 'AbortError')
        ? 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.'
        : 'Không thể kết nối máy chủ. Kiểm tra mạng rồi thử lại.',
      0,
    );
  } finally {
    clearTimeout(timer);
  }
}
