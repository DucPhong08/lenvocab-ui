import type { Asset } from 'react-native-image-picker';
import type { Box } from '@/api/contracts';
import { ApiError } from '@/api/client/ApiError';
import { request } from '@/api/client/request';
import { prepareCardImage } from '@/services/images/prepareCardImage';

export type CardImage = {
  image_url: string | null;
  has_image: boolean;
  image_style?: 'photo' | 'sticker';
};
const path = (id: string) => `/flashcards/${encodeURIComponent(id)}/image`;

export const getCardImage = (token: string, id: string) =>
  request<CardImage>(path(id), {}, token);
export const deleteCardImage = (token: string, id: string) =>
  request<CardImage>(path(id), { method: 'DELETE' }, token);

export async function uploadCardImage(
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
  const prepared = await prepareCardImage(asset, crop);
  try {
    const form = new FormData();
    form.append('style', 'sticker');
    form.append('file', {
      uri: prepared.asset.uri,
      type: prepared.asset.type || 'image/jpeg',
      name: prepared.asset.fileName || 'card.jpg',
    } as unknown as Blob);
    if (prepared.crop) form.append('crop', JSON.stringify(prepared.crop));
    return await request<CardImage>(
      path(id),
      { method: 'PUT', body: form },
      token,
    );
  } finally {
    await prepared.cleanup();
  }
}
