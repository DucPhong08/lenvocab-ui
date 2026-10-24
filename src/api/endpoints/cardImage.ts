import type { Asset } from 'react-native-image-picker';
import type { Box } from '@/api/contracts';
import { ApiError } from '@/api/client/ApiError';
import { request } from '@/api/client/request';

export type CardImage = { image_url: string | null; has_image: boolean };
const path = (id: string) => `/flashcards/${encodeURIComponent(id)}/image`;

export const getCardImage = (token: string, id: string) =>
  request<CardImage>(path(id), {}, token);
export const deleteCardImage = (token: string, id: string) =>
  request<CardImage>(path(id), { method: 'DELETE' }, token);

export function uploadCardImage(
  token: string,
  id: string,
  asset: Asset,
  crop?: Box | null,
) {
  if (!asset.uri)
    throw new ApiError('Không còn ảnh trên thiết bị. Hãy chọn lại ảnh.', 0);
  if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024)
    throw new ApiError('Ảnh vượt quá 5 MB. Hãy chọn ảnh nhỏ hơn.', 0);
  if (asset.type && !['image/jpeg', 'image/png'].includes(asset.type))
    throw new ApiError('Chỉ hỗ trợ ảnh JPG hoặc PNG.', 0);
  const form = new FormData();
  form.append('file', {
    uri: asset.uri,
    type: asset.type || 'image/jpeg',
    name: asset.fileName || 'card.jpg',
  } as unknown as Blob);
  if (crop) form.append('crop', JSON.stringify(crop));
  return request<CardImage>(path(id), { method: 'PUT', body: form }, token);
}
