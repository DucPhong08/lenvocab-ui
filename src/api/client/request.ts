import { ApiError } from './ApiError';
import { API_ORIGIN } from './config';

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
    const detail = body?.detail;
    const message =
      response.status === 401
        ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
        : response.status === 429 && detail === 'GUEST_SLOW_DOWN'
        ? 'Vui lòng đợi 10 giây trước khi quét tiếp.'
        : response.status === 429
        ? 'Đã hết lượt quét thử của khách hôm nay. Đăng nhập để tiếp tục.'
        : response.status === 403 &&
          String(JSON.stringify(detail) ?? '').includes('QUOTA_EXCEEDED')
        ? 'Bạn đã hết lượt quét hôm nay.'
        : typeof detail === 'string'
        ? detail
        : typeof detail?.message === 'string'
        ? detail.message
        : response.status === 413
        ? 'Ảnh vượt quá 5 MB. Hãy chọn ảnh nhỏ hơn.'
        : 'Yêu cầu chưa thực hiện được. Vui lòng thử lại.';
    throw new ApiError(message, response.status);
  }

  return body as T;
}

