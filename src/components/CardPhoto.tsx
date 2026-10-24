import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { ApiError } from '@/api/client/ApiError';
import {
  deleteCardImage,
  uploadCardImage,
  type CardImage as Photo,
} from '@/api/endpoints/cardImage';
import { CardImage } from './CardImage';
import { colors } from '@/theme/theme';

export function CardPhoto({
  cardId,
  imageUrl,
  hasImage,
  token,
  term,
  onChanged,
  onUnauthorized,
}: {
  cardId: string;
  imageUrl?: string | null;
  hasImage?: boolean;
  token: string | null;
  term: string;
  onChanged: () => Promise<unknown>;
  onUnauthorized: () => Promise<unknown>;
}) {
  const [photo, setPhoto] = useState<Photo>({
    image_url: imageUrl ?? null,
    has_image: !!hasImage,
  });
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const current = useRef({ cardId, token });
  current.current = { cardId, token };
  const generation = useRef(0);
  useEffect(() => {
    generation.current += 1;
    setPhoto({ image_url: imageUrl ?? null, has_image: !!hasImage });
    return () => {
      generation.current += 1;
    };
  }, [cardId, imageUrl, hasImage, token]);

  const change = async (remove: boolean) => {
    if (
      !token ||
      locked.current ||
      current.current.token !== token ||
      current.current.cardId !== cardId
    )
      return;
    locked.current = true;
    setBusy(true);
    const version = generation.current;
    try {
      let result: Photo;
      if (remove) result = await deleteCardImage(token, cardId);
      else {
        const picked = await launchImageLibrary({
          mediaType: 'photo',
          maxWidth: 1600,
          maxHeight: 1600,
          quality: 0.8,
        });
        if (picked.didCancel || version !== generation.current) return;
        const asset = picked.assets?.[0];
        if (!asset?.uri)
          throw new Error('Chưa chọn được ảnh. Vui lòng thử lại.');
        result = await uploadCardImage(token, cardId, asset);
      }
      if (version !== generation.current) return;
      setPhoto(result);
      try {
        await onChanged();
      } catch {
        if (version === generation.current)
          Alert.alert(
            'Đã cập nhật ảnh',
            'Chưa tải lại được kho từ. Vui lòng thử lại sau.',
          );
      }
    } catch (error) {
      if (version !== generation.current) return;
      if (error instanceof ApiError && error.status === 401)
        await onUnauthorized();
      else
        Alert.alert(
          'Chưa cập nhật được ảnh',
          error instanceof Error ? error.message : 'Vui lòng thử lại.',
        );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };
  if (!token) return null;
  return (
    <View style={styles.section}>
      {(photo.has_image || photo.image_url) && (
        <CardImage
          imageUrl={photo.image_url}
          cardId={cardId}
          token={token}
          label={`Ảnh của bạn: ${term}`}
        />
      )}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            photo.has_image ? 'Đổi ảnh của thẻ' : 'Thêm ảnh của bạn'
          }
          disabled={busy}
          onPress={() => {
            change(false).catch(() => {});
          }}
          style={styles.button}
        >
          <Text style={styles.label}>
            {busy
              ? 'Đang cập nhật ảnh...'
              : photo.has_image
              ? 'Đổi ảnh'
              : 'Thêm ảnh của bạn'}
          </Text>
        </Pressable>
        {photo.has_image && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Xóa ảnh của thẻ"
            disabled={busy}
            onPress={() =>
              Alert.alert(
                'Xóa ảnh của thẻ?',
                'Thẻ từ và tiến độ ôn tập vẫn được giữ.',
                [
                  { text: 'Hủy', style: 'cancel' },
                  {
                    text: 'Xóa ảnh',
                    style: 'destructive',
                    onPress: () => {
                      change(true).catch(() => {});
                    },
                  },
                ],
              )
            }
            style={styles.button}
          >
            <Text style={styles.remove}>Xóa ảnh</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  section: { marginBottom: 18, gap: 8 },
  actions: { flexDirection: 'row', gap: 12 },
  button: { paddingVertical: 12, minHeight: 44 },
  label: { color: colors.forest, fontWeight: '700' },
  remove: { color: colors.error, fontWeight: '700' },
});
