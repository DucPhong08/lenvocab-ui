import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Word } from '@/data/scenes';
import { colors } from '@/theme/theme';
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
  return (
    <View style={styles.grid}>
      {words.map(word => (
        <Pressable
          key={word.id}
          accessibilityRole="button"
          accessibilityLabel={`Xem từ ${word.term}, nghĩa là ${word.meaning}`}
          onPress={() => onOpen(word.id)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={styles.image}>
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

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  pressed: { opacity: 0.75 },
  image: {
    height: 112,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  initial: { color: colors.lime, fontWeight: '800', fontSize: 44 },
  copy: { padding: 10, gap: 5 },
  term: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  meaning: { color: colors.muted, fontSize: 13 },
});
