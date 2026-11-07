import { createStyles } from '@/theme/styles';
import { Pressable, Text, View } from 'react-native';
import type { Word } from '@/data/scenes';
import { CardImage } from './CardImage';

export function WordGrid({
  words,
  token,
  onOpen,
}: {
  words: Word[];
  token?: string | null;
  onOpen: (id: string) => void;
}) {
  const { styles } = useStyles();
  return (
    <View style={styles.grid}>
      {words.map((word, index) => (
        <Pressable
          key={word.id}
          accessibilityRole="button"
          accessibilityLabel={`Xem từ ${word.term}, nghĩa là ${word.meaning}`}
          onPress={() => onOpen(word.id)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View
            style={[styles.image, index % 2 === 1 && styles.alternateImage]}
          >
            {word.imageUrl || word.hasImage ? (
              <CardImage
                imageUrl={word.imageUrl}
                isSticker={word.imageStyle === 'sticker'}
                cardId={word.userFlashcardId}
                token={token}
                label={`Ảnh của bạn: ${word.term}`}
                variant="tile"
              />
            ) : (
              <Text style={styles.initial}>{word.term[0].toUpperCase()}</Text>
            )}
          </View>
          <View style={styles.copy}>
            <Text style={styles.term}>{word.term}</Text>
            <Text style={styles.meaning}>{word.meaning}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const useStyles = createStyles(({ colors, font }) => ({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 19,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.75 },
  image: {
    height: 104,
    backgroundColor: colors.stickerTint,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  alternateImage: { backgroundColor: colors.accentTint },
  initial: {
    color: colors.primaryText,
    fontWeight: font.weight.heavy,
    fontSize: font.size.initial,
  },
  copy: { padding: 10, gap: 5 },
  term: {
    color: colors.text,
    ...font.label,
  },
  meaning: { color: colors.muted, fontSize: font.size.small },
}));
