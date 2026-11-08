import { detectOffline } from '@/services/vision/offlineDetector';
import NativeOfflineVision from '@/specs/NativeOfflineVision';

jest.mock('@/specs/NativeOfflineVision', () => ({
  __esModule: true,
  default: { detect: jest.fn() },
}));
beforeEach(() => {
  jest.clearAllMocks();
});

test.each([1, 3, 8, 10])(
  'honors the synced object count %s and confidence threshold',
  async count => {
    jest
      .mocked(NativeOfflineVision!.detect)
      .mockResolvedValue({
        width: 800,
        height: 600,
        elapsedMs: 50,
        objects: [],
      });
    await detectOffline(
      { uri: 'content://photos/1', type: 'image/jpeg' },
      {
        max_detected_objects: count,
        max_allowed_objects: 10,
        confidence_threshold: 0.72,
      },
    );
    expect(NativeOfflineVision!.detect).toHaveBeenCalledWith(
      'content://photos/1',
      0.72,
      count,
    );
  },
);

const settings = {
  max_detected_objects: 5,
  max_allowed_objects: 10,
  confidence_threshold: 0.5,
};
test.each([0, 11, 2.5, NaN])(
  'rejects invalid synced counts %s before native processing',
  async count => {
    await expect(
      detectOffline(
        { uri: 'file:///a.jpg' },
        { ...settings, max_detected_objects: count },
      ),
    ).rejects.toThrow('Thiết lập');
    expect(NativeOfflineVision!.detect).not.toHaveBeenCalled();
  },
);
test.each([-0.1, 1.1, NaN])('rejects invalid confidence %s', async score => {
  await expect(
    detectOffline(
      { uri: 'file:///a.jpg' },
      { ...settings, confidence_threshold: score },
    ),
  ).rejects.toThrow('Thiết lập');
  expect(NativeOfflineVision!.detect).not.toHaveBeenCalled();
});

test.each([
  'https://example.com/private.jpg',
  'http://example.com/image.jpg',
  'data:image/png;base64,abc',
  '../image.jpg',
])('rejects non-local input %s before calling native code', async uri => {
  await expect(detectOffline({ uri }, settings)).rejects.toThrow('thiết bị');
  expect(NativeOfflineVision!.detect).not.toHaveBeenCalled();
});

test('rejects oversized or unsupported images without processing', async () => {
  await expect(
    detectOffline(
      { uri: 'file:///a.jpg', fileSize: 6 * 1024 * 1024 },
      settings,
    ),
  ).rejects.toThrow('5 MB');
  await expect(
    detectOffline({ uri: 'file:///a.gif', type: 'image/gif' }, settings),
  ).rejects.toThrow('JPG');
  expect(NativeOfflineVision!.detect).not.toHaveBeenCalled();
});
