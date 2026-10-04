import { getApiErrorMessage } from '@/api/client/getApiErrorMessage';
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
