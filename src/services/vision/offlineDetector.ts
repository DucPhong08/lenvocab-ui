import NativeOfflineVision, {
  type DetectionResult,
} from '@/specs/NativeOfflineVision';
import type { ScanSettings } from '@/api/contracts';
import { MAX_IMAGE_BYTES } from '@/services/images/options';
import type { Asset } from 'react-native-image-picker';

export const offlineScanAvailable = !!NativeOfflineVision;

export async function detectOffline(
  asset: Asset,
  settings: ScanSettings,
): Promise<DetectionResult> {
  if (!NativeOfflineVision)
    throw new Error('Quét offline chỉ có trong bản Android thử nghiệm.');
  if (!asset.uri || !/^(file|content):\/\//i.test(asset.uri))
    throw new Error('Hãy chọn ảnh có trên thiết bị.');
  if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES)
    throw new Error('Chọn ảnh JPG hoặc PNG không quá 5 MB.');
  if (asset.type && !['image/jpeg', 'image/png'].includes(asset.type))
    throw new Error('Chọn ảnh JPG hoặc PNG.');
  const { max_detected_objects: count, confidence_threshold: score } = settings;
  if (
    !Number.isInteger(count) ||
    count < 1 ||
    count > 10 ||
    !Number.isFinite(score) ||
    score < 0 ||
    score > 1
  )
    throw new Error(
      'Thiết lập nhận diện không hợp lệ. Hãy đồng bộ lại cài đặt.',
    );
  return NativeOfflineVision.detect(asset.uri, score, count);
}
