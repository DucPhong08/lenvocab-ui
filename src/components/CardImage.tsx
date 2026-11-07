import { createStyles } from '@/theme/styles';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { getCardImage } from '@/api/endpoints/cardImage';

export function CardImage({
  imageUrl,
  cardId,
  token,
  label,
  variant = 'detail',
  fallback = '?',
  isSticker = false,
}: {
  imageUrl?: string | null;
  cardId?: string;
  token?: string | null;
  label: string;
  variant?: 'thumbnail' | 'detail' | 'flashcard' | 'sticker' | 'tile';
  fallback?: string;
  isSticker?: boolean;
}) {
  const { styles } = useStyles();
  const [uri, setUri] = useState(imageUrl ?? null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const generation = useRef(0);
  const refreshed = useRef(false);
  useEffect(() => {
    generation.current += 1;
    setUri(imageUrl ?? null);
    setFailed(false);
    setLoading(false);
    refreshed.current = false;
    return () => {
      generation.current += 1;
    };
  }, [imageUrl, cardId, token]);
  const refresh = async () => {
    const version = generation.current;
    if (!cardId || !token || refreshed.current) {
      setFailed(true);
      return;
    }
    refreshed.current = true;
    setLoading(true);
    try {
      const result = await getCardImage(token, cardId);
      if (version !== generation.current) return;
      setUri(result.image_url);
      setFailed(!result.image_url);
    } catch {
      if (version === generation.current) setFailed(true);
    } finally {
      if (version === generation.current) setLoading(false);
    }
  };
  if (cardId && !token) return null;
  if (uri && !failed)
    return (
      <Image
        source={{ uri }}
        resizeMode={isSticker ? 'contain' : 'cover'}
        accessibilityLabel={label}
        onError={() => {
          refresh().catch(() => {});
        }}
        style={[
          styles[variant],
          isSticker && variant !== 'tile' && styles.stickerBackground,
        ]}
      />
    );
  return (
    <View style={[styles[variant], styles.placeholder]}>
      {variant === 'thumbnail' ? (
        <Text style={styles.initial}>{fallback}</Text>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tải lại ảnh"
          disabled={loading}
          onPress={event => {
            event.stopPropagation();
            refreshed.current = false;
            refresh().catch(() => {});
          }}
        >
          <Text style={styles.caption}>
            {loading
              ? 'Đang tải ảnh...'
              : 'Ảnh chưa tải được. Chạm để thử lại.'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const useStyles = createStyles(({ colors, font }) => ({
  tile: { width: '100%', height: '100%' },
  stickerBackground: { backgroundColor: colors.stickerTint, borderRadius: 14 },
  sticker: { width: '100%', height: 200 },
  thumbnail: { width: 44, height: 44, borderRadius: 13 },
  detail: { width: '100%', height: 210, borderRadius: 18 },
  flashcard: { width: 180, height: 100, borderRadius: 14 },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  initial: {
    fontSize: font.size.section,
    fontWeight: font.weight.heavy,
    color: colors.primaryText,
  },
  caption: {
    color: colors.muted,
    fontSize: font.size.small,
    textAlign: 'center',
    padding: 8,
  },
}));
