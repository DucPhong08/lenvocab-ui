import { useCallback } from 'react';
import { Alert } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
} from 'react-native-image-picker';

export function useImagePicker(
  selectImage: (asset: Asset | null) => void,
) {
  return useCallback(
    async (source: 'camera' | 'library') => {
      try {
        const result =
          source === 'camera'
            ? await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
                saveToPhotos: false,
              })
            : await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 1,
                quality: 0.8,
              });

        if (result.didCancel) return;
        if (result.errorCode) {
          Alert.alert(
            'Không thể mở ảnh',
            result.errorMessage ??
              'Vui lòng thử lại hoặc chọn một cảnh mẫu.',
          );
          return;
        }

        const picked = result.assets?.[0];
        if (picked?.type && !['image/jpeg', 'image/png'].includes(picked.type)) {
          Alert.alert('Định dạng chưa hỗ trợ', 'Chọn ảnh JPG hoặc PNG để quét.');
          return;
        }
        if (picked?.fileSize && picked.fileSize > 5 * 1024 * 1024) {
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
