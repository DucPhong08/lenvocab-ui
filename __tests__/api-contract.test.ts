import { getApiErrorMessage } from '@/api/client/getApiErrorMessage';
import { ApiError } from '@/api/client/ApiError';
import { request } from '@/api/client/request';
import type { ScanResult } from '@/api/contracts';
import { scanWord } from '@/api/mappers/scanWord';

test('maps backend error codes before generic HTTP statuses', () => {
  expect(getApiErrorMessage(401, 'INVALID_CREDENTIALS')).toBe(
    'Email hoặc mật khẩu không đúng.',
  );
  expect(getApiErrorMessage(401, 'TOKEN_EXPIRED')).toBe(
    'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  );
  expect(getApiErrorMessage(413, 'IMAGE_TOO_LARGE')).toBe(
    'Ảnh vượt quá 5 MB. Hãy chọn ảnh nhỏ hơn.',
  );
  expect(getApiErrorMessage(409, 'DRAFT_EXPIRED')).toBe(
    'Thẻ nháp đã hết hạn. Vui lòng quét lại ảnh.',
  );
});

test('rejects a successful response with invalid JSON', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockRejectedValue(new SyntaxError('invalid JSON')),
  });
  try {
    await expect(request('/health')).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: 'ApiError',
        message: 'Máy chủ trả về dữ liệu không hợp lệ.',
        status: 0,
      }),
    );
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('rejects a successful response with a null JSON body', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(null),
  });
  try {
    await expect(request('/health')).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: 'ApiError',
        message: 'Máy chủ trả về dữ liệu không hợp lệ.',
        status: 0,
      }),
    );
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('keeps the timeout active while reading the response body', async () => {
  jest.useFakeTimers();
  const previousFetch = globalThis.fetch;
  globalThis.fetch = jest.fn((_url, options) =>
    Promise.resolve({
      ok: true,
      json: () =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () =>
            reject(Object.assign(new Error('Aborted'), { name: 'AbortError' })),
          );
        }),
    } as Response),
  ) as typeof fetch;
  try {
    const pending = request('/health');
    const assertion = expect(pending).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: 'ApiError',
        message: 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.',
        status: 0,
      }),
    );
    await jest.advanceTimersByTimeAsync(45000);
    await assertion;
  } finally {
    jest.useRealTimers();
    globalThis.fetch = previousFetch;
  }
});

test('keeps the two backend examples as English example sentences', () => {
  const result: ScanResult = {
    status: 'OK',
    keyword: 'chair',
    pronunciation: '/tʃer/',
    meaning_vi: 'cái ghế',
    example_1: 'I sit on a chair.',
    example_2: 'This chair is comfortable.',
    related_words: ['seat'],
    aliases: [],
    categories: ['Furniture'],
    parents: [],
    audio_base64: null,
    confidence: 99,
    detected_objects: [],
    bounding_box: null,
    source: 'bedrock',
    is_draft: true,
    message: null,
  };

  const word = scanWord(result);
  expect(word).toEqual(
    expect.objectContaining({
      example: 'I sit on a chair.',
      example2: 'This chair is comfortable.',
    }),
  );
  expect(word.translation).toBeUndefined();
});
