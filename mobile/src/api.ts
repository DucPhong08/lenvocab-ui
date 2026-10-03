import type { Asset } from 'react-native-image-picker';
import type { Word } from './data';

// OpenAPI is published at the origin root; /api is not a valid prefix on this deployment.
export const API_ORIGIN = 'https://app-lensvocab.onrender.com';

export type User = {
  id: string;
  email: string;
  display_name: string | null;
  account_tier: string;
  daily_quota_left: number;
};
export type Box = { left: number; top: number; width: number; height: number };
export type DetectedObject = { keyword: string; confidence: number; bounding_box: Box | null };
export type ScanResult = {
  status: string;
  keyword: string | null;
  pronunciation: string | null;
  meaning_vi: string | null;
  example_1: string | null;
  example_2: string | null;
  related_words: string[];
  audio_base64: string | null;
  detected_objects: DetectedObject[];
  bounding_box: Box | null;
  message: string | null;
};
export type Flashcard = {
  user_flashcard_id: string;
  keyword: string;
  pronunciation: string | null;
  meaning_vi: string;
  example_1: string;
  example_2: string;
  related_words: string[];
  audio_base64: string | null;
  status?: string;
  repetitions?: number;
  next_review_date?: string;
};
export type ReviewCard = Flashcard;

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), path === '/vision/scan' ? 120000 : 45000);
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
    throw new ApiError(cause instanceof Error && cause.name === 'AbortError' ? 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.' : 'Không thể kết nối máy chủ. Kiểm tra mạng rồi thử lại.', 0);
  } finally { clearTimeout(timer); }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.detail;
    const message = response.status === 401 ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      : response.status === 429 && detail === 'GUEST_SLOW_DOWN' ? 'Vui lòng đợi 10 giây trước khi quét tiếp.'
      : response.status === 429 ? 'Đã hết lượt quét thử của khách hôm nay. Đăng nhập để tiếp tục.'
      : response.status === 403 && (String(JSON.stringify(detail) ?? '').includes('QUOTA_EXCEEDED')) ? 'Bạn đã hết lượt quét hôm nay.'
      : typeof detail === 'string' ? detail
      : typeof detail?.message === 'string' ? detail.message
      : response.status === 413 ? 'Ảnh vượt quá 5 MB. Hãy chọn ảnh nhỏ hơn.'
      : 'Yêu cầu chưa thực hiện được. Vui lòng thử lại.';
    throw new ApiError(message, response.status);
  }
  return body as T;
}

const json = (value: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(value),
});

export async function authenticate(mode: 'login' | 'register', email: string, password: string, name: string) {
  return request<{ access_token: string }>(`/auth/${mode}`, json({ email: email.trim().toLowerCase(), password, ...(mode === 'register' ? { display_name: name.trim() || null } : {}) }));
}
export const getMe = (token: string) => request<User>('/auth/me', {}, token);
export const listFlashcards = (token: string) => request<Flashcard[]>('/flashcards', {}, token);
export const reviewToday = (token: string) => request<ReviewCard[]>('/review/today', {}, token);
export const gradeReview = (token: string, id: string, quality: number) => request(`/review/${encodeURIComponent(id)}`, json({ quality }), token);
export const confirmFlashcard = (token: string, draft: ScanResult) => {
  if (!draft.keyword || !draft.meaning_vi || !draft.example_1 || !draft.example_2) {
    throw new ApiError('Thẻ nháp thiếu nội dung để lưu.', 0);
  }
  return request<Flashcard>('/flashcards/confirm', json({
    keyword: draft.keyword,
    pronunciation: draft.pronunciation,
    meaning_vi: draft.meaning_vi,
    example_1: draft.example_1,
    example_2: draft.example_2,
    related_words: draft.related_words ?? [],
    audio_base64: draft.audio_base64,
  }), token);
};
export async function scanImage(token: string | null, asset: Asset) {
  if (!asset.uri) throw new ApiError('Vui lòng chụp hoặc chọn một ảnh trước.', 0);
  if (asset.type && !['image/jpeg', 'image/png'].includes(asset.type)) throw new ApiError('Chỉ hỗ trợ ảnh JPG hoặc PNG.', 0);
  if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) throw new ApiError('Ảnh vượt quá 5 MB. Hãy chọn ảnh nhỏ hơn.', 0);
  const file = { uri: asset.uri, type: asset.type === 'image/png' ? 'image/png' : 'image/jpeg', name: asset.fileName ?? 'scan.jpg' };
  const form = new FormData();
  form.append('file', file as unknown as Blob);
  return request<ScanResult>(token ? '/vision/scan' : '/vision/scan/guest', { method: 'POST', body: form }, token ?? undefined);
}

export function scanWord(result: ScanResult): Word {
  return {
    id: `scan:${result.keyword ?? 'unknown'}`,
    term: result.keyword ?? 'Chưa nhận diện',
    ipa: result.pronunciation ?? '',
    type: 'từ vựng',
    meaning: result.meaning_vi ?? '',
    example: result.example_1 ?? '',
    translation: result.example_2 ?? '',
    note: result.related_words?.length ? `Từ liên quan: ${result.related_words.join(', ')}` : 'Học từ này qua ngữ cảnh trong ảnh của bạn.',
    level: 'AI', scene: 'desk',
  };
}
export function cardWord(card: Flashcard): Word {
  return {
    id: card.user_flashcard_id, term: card.keyword, ipa: card.pronunciation ?? '', type: 'từ vựng',
    meaning: card.meaning_vi, example: card.example_1, translation: card.example_2,
    note: card.related_words?.length ? `Từ liên quan: ${card.related_words.join(', ')}` : 'Ôn lại để ghi nhớ từ này.',
    level: card.status ?? 'Đã lưu', scene: 'desk',
  };
}
