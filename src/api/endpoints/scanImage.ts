import type { Asset } from 'react-native-image-picker';
import { ApiError } from '@/api/client/ApiError';
import { request } from '@/api/client/request';
import type { ScanResult } from '@/api/contracts';

export function scanImage(token: string | null, asset: Asset) {
  if (!asset.uri) {
    throw new ApiError('Vui lòng chụp hoặc chọn một ảnh trước.', 0);
  }
  if (asset.type && !['image/jpeg', 'image/png'].includes(asset.type)) {
    throw new ApiError('Chỉ hỗ trợ ảnh JPG hoặc PNG.', 0);
  }
  if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
    throw new ApiError('Ảnh vượt quá 5 MB. Hãy chọn ảnh nhỏ hơn.', 0);
  }

  const file = {
    uri: asset.uri,
    type: asset.type === 'image/png' ? 'image/png' : 'image/jpeg',
    name: asset.fileName ?? 'scan.jpg',
  };
  const form = new FormData();
  form.append('file', file as unknown as Blob);

  return request<ScanResult>(
    token ? '/vision/scan' : '/vision/scan/guest',
    { method: 'POST', body: form },
    token ?? undefined,
  );
}

