import { Image } from 'react-native';
import RNFS from 'react-native-fs';
import ImageEditor from '@react-native-community/image-editor';
import {
  cropPixels,
  jpegOrientation,
  prepareCardImage,
} from '@/services/images/prepareCardImage';
import { uploadCardImage } from '@/api/endpoints/cardImage';
import { request } from '@/api/client/request';

jest.mock('react-native-fs', () => ({
  read: jest.fn(),
  unlink: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@react-native-community/image-editor', () => ({
  __esModule: true,
  default: { cropImage: jest.fn() },
}));
jest.mock('@/api/client/request', () => ({ request: jest.fn() }));
const box = { left: 0.25, top: 0.1, width: 0.5, height: 0.2 };
const asset = { uri: 'file:///original.jpg', type: 'image/jpeg' };
const photo = {
  uri: 'file:///cache/crop.jpg',
  path: '/cache/crop.jpg',
  name: 'crop.jpg',
  size: 10000,
  width: 768,
  height: 230,
  type: 'image/jpeg' as const,
  base64: '',
};
function exif(orientation: number, little = true) {
  const data = new Uint8Array(38);
  const view = new DataView(data.buffer);
  view.setUint16(0, 0xffd8);
  view.setUint16(2, 0xffe1);
  view.setUint16(4, 34);
  data.set([69, 120, 105, 102, 0, 0], 6);
  view.setUint16(12, little ? 0x4949 : 0x4d4d);
  view.setUint16(14, 42, little);
  view.setUint32(16, 8, little);
  view.setUint16(20, 1, little);
  view.setUint16(22, 0x112, little);
  view.setUint16(24, 3, little);
  view.setUint32(26, 1, little);
  view.setUint16(30, orientation, little);
  return String.fromCharCode(...data);
}
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(RNFS.read).mockResolvedValue(exif(1));
  jest.mocked(ImageEditor.cropImage).mockResolvedValue(photo);
  jest
    .mocked(request)
    .mockResolvedValue({ image_url: 'private', has_image: true });
  jest
    .spyOn(Image, 'getSize')
    .mockImplementation(() => Promise.resolve({ width: 4000, height: 3000 }));
});
afterEach(() => jest.restoreAllMocks());

test.each([1, 3, 6, 8])(
  'reads JPEG orientation %s with either TIFF byte order',
  orientation => {
    expect(jpegOrientation(exif(orientation))).toBe(orientation);
    expect(jpegOrientation(exif(orientation, false))).toBe(orientation);
  },
);
test('does not guess orientation for incomplete EXIF', () => {
  expect(jpegOrientation(exif(1).slice(0, 25))).toBeNull();
  expect(jpegOrientation('PNG image')).toBeNull();
});
test('matches server floor/ceil crop and caps the longest edge at 768', () => {
  expect(cropPixels(4000, 3000, box)).toEqual({
    offset: { x: 1000, y: 300 },
    size: { width: 2000, height: 601 },
    displaySize: { width: 768, height: 231 },
  });
  expect(cropPixels(100, 100, box).displaySize).toEqual({
    width: 50,
    height: 21,
  });
  expect(() => cropPixels(100, 100, { ...box, left: -0.1 })).toThrow();
});
test('uploads only the crop without asking the server to crop it a second time', async () => {
  const append = jest.spyOn(FormData.prototype, 'append');
  await uploadCardImage('token', 'card', asset, box);
  expect(ImageEditor.cropImage).toHaveBeenCalledWith(
    asset.uri,
    expect.objectContaining({ offset: { x: 1000, y: 300 } }),
  );
  expect(append).toHaveBeenCalledWith(
    'file',
    expect.objectContaining({ uri: photo.uri }),
  );
  expect(append.mock.calls.some(([name]) => name === 'crop')).toBe(false);
  expect(RNFS.unlink).toHaveBeenCalledWith(photo.path);
  expect(RNFS.unlink).not.toHaveBeenCalledWith(asset.uri);
});
test('cleans the generated crop when upload fails', async () => {
  jest.mocked(request).mockRejectedValueOnce(new Error('offline'));
  await expect(uploadCardImage('token', 'card', asset, box)).rejects.toThrow(
    'offline',
  );
  expect(RNFS.unlink).toHaveBeenCalledWith(photo.path);
});
test.each(['png', 'mirrored', 'unreadable', 'crop-failure'])(
  'keeps the server crop path for %s',
  async kind => {
    if (kind === 'mirrored') jest.mocked(RNFS.read).mockResolvedValue(exif(2));
    if (kind === 'unreadable')
      jest.mocked(RNFS.read).mockRejectedValueOnce(new Error('denied'));
    if (kind === 'crop-failure')
      jest
        .mocked(ImageEditor.cropImage)
        .mockRejectedValueOnce(new Error('native failure'));
    const input = kind === 'png' ? { ...asset, type: 'image/png' } : asset;
    const result = await prepareCardImage(input, box);
    expect(result.asset).toBe(input);
    expect(result.crop).toBe(box);
    await result.cleanup();
    expect(RNFS.unlink).not.toHaveBeenCalled();
  },
);
