import { Image } from 'react-native';
import ImageEditor from '@react-native-community/image-editor';
import RNFS from 'react-native-fs';
import type { Asset } from 'react-native-image-picker';
import type { Box } from '@/api/contracts';

// Read only bounded JPEG metadata. Mirrored/unknown EXIF and PNG keep the
// established server crop path rather than risk selecting a different object.
export function jpegOrientation(data: string): number | null {
  const bytes = Uint8Array.from(data, char => char.charCodeAt(0));
  const view = new DataView(bytes.buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null;
  for (let pos = 2; pos + 4 <= bytes.length; ) {
    const marker = view.getUint16(pos);
    if (marker === 0xffda || marker === 0xffd9) return 1;
    const length = view.getUint16(pos + 2);
    if (length < 2 || pos + 2 + length > bytes.length) return null;
    if (marker === 0xffe1 && data.slice(pos + 4, pos + 10) === 'Exif\0\0') {
      const start = pos + 10;
      const end = pos + 2 + length;
      if (start + 8 > end) return null;
      const endian = view.getUint16(start);
      if (endian !== 0x4949 && endian !== 0x4d4d) return null;
      const little = endian === 0x4949;
      if (view.getUint16(start + 2, little) !== 42) return null;
      const ifd = start + view.getUint32(start + 4, little);
      if (ifd < start || ifd + 2 > end) return null;
      const count = view.getUint16(ifd, little);
      for (let i = 0; i < count; i++) {
        const entry = ifd + 2 + i * 12;
        if (entry + 12 > end) return null;
        if (view.getUint16(entry, little) === 0x0112) {
          if (
            view.getUint16(entry + 2, little) !== 3 ||
            view.getUint32(entry + 4, little) !== 1
          )
            return null;
          return view.getUint16(entry + 8, little);
        }
      }
      return 1;
    }
    pos += length + 2;
  }
  return null;
}

export function cropPixels(width: number, height: number, box: Box) {
  if (
    ![width, height, ...Object.values(box)].every(Number.isFinite) ||
    width < 1 ||
    height < 1 ||
    box.left < 0 ||
    box.top < 0 ||
    box.width <= 0 ||
    box.height <= 0 ||
    box.left + box.width > 1.000001 ||
    box.top + box.height > 1.000001
  )
    throw new Error('Vùng ảnh không hợp lệ. Hãy quét lại ảnh.');
  const x = Math.floor(box.left * width);
  const y = Math.floor(box.top * height);
  const w = Math.min(width, Math.ceil((box.left + box.width) * width)) - x;
  const h = Math.min(height, Math.ceil((box.top + box.height) * height)) - y;
  const scale = Math.min(1, 768 / Math.max(w, h));
  return {
    offset: { x, y },
    size: { width: w, height: h },
    displaySize: {
      width: Math.max(1, Math.round(w * scale)),
      height: Math.max(1, Math.round(h * scale)),
    },
  };
}

export async function prepareCardImage(asset: Asset, crop?: Box | null) {
  const original = { asset, crop, cleanup: async () => {} };
  if (!crop || !asset.uri?.startsWith('file://') || asset.type === 'image/png')
    return original;
  let path: string | undefined;
  try {
    const header = await RNFS.read(asset.uri, 96 * 1024, 0, 'ascii');
    const orientation = jpegOrientation(header);
    if (orientation === null || ![1, 3, 6, 8].includes(orientation))
      return original;
    const { width, height } = await Image.getSize(asset.uri);
    const photo = await ImageEditor.cropImage(asset.uri, {
      ...cropPixels(width, height, crop),
      format: 'jpeg',
      quality: 0.9,
    });
    path = photo.path;
    if (photo.size > 5 * 1024 * 1024) throw new Error('Ảnh quá lớn.');
    return {
      asset: {
        uri: photo.uri,
        type: photo.type,
        fileName: photo.name,
        fileSize: photo.size,
      },
      crop: null,
      cleanup: () => RNFS.unlink(photo.path).catch(() => {}),
    };
  } catch {
    if (path) await RNFS.unlink(path).catch(() => {});
    return original;
  }
}
