import { useCallback } from 'react';
import { Alert } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
} from 'react-native-image-picker';
import { PHOTO_OPTIONS, MAX_IMAGE_BYTES } from '@/services/images/options';

export function useImagePicker(selectImage: (asset: Asset | null) => void) {
  return useCallback(
    async (source: 'camera' | 'library') => {
      try {
        const result =
          source === 'camera'
            ? await launchCamera({
                ...PHOTO_OPTIONS,
                saveToPhotos: false,
              })
            : await launchImageLibrary({
                ...PHOTO_OPTIONS,
                selectionLimit: 1,
              });

        if (result.didCancel) return;
        if (result.errorCode) {
          Alert.alert(
            'Không thể mở ảnh',
            result.errorMessage ?? 'Vui lòng thử lại hoặc chọn một cảnh mẫu.',
          );
          return;
        }

        const picked = result.assets?.[0];
        if (
          picked?.type &&
          !['image/jpeg', 'image/png'].includes(picked.type)
        ) {
          Alert.alert(
            'Định dạng chưa hỗ trợ',
            'Chọn ảnh JPG hoặc PNG để quét.',
          );
          return;
        }
        if (picked?.fileSize && picked.fileSize > MAX_IMAGE_BYTES) {
          Alert.alert('Ảnh quá lớn', 'Hãy chọn ảnh JPG/PNG không quá 5 MB.');
          return;
        }
        if (picked?.uri) selectImage(picked);
      } catch {
        Alert.alert(
          'Không thể mở ảnh',
          'Kiểm tra quyền truy cập máy ảnh hoặc thư viện ảnh.',
        );
      }
    },
    [selectImage],
  );
}
