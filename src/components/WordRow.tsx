import { Pressable, Text, View } from 'react-native';
import { Bookmark, ChevronRight } from 'lucide-react-native';
import type { Word } from '@/data/scenes';
import { styles } from './styles/content.styles';
import { colors } from '@/theme/theme';

export function WordRow({
  word,
  saved,
  onOpen,
  onSave,
}: {
  word: Word;
  saved: boolean;
  onOpen: () => void;
  onSave?: () => void;
}) {
  return (
    <View style={styles.wordRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Xem từ ${word.term}, nghĩa là ${word.meaning}`}
        onPress={onOpen}
        style={({ pressed }) => [styles.wordMain, pressed && styles.pressed]}
      >
        <View style={styles.wordInitial}>
          <Text style={styles.wordInitialText}>
            {word.term[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.fill}>
          <Text style={styles.wordTerm}>{word.term}</Text>
          <Text style={styles.wordMeaning} numberOfLines={1}>
            {word.type} · {word.meaning}
          </Text>
        </View>
        <ChevronRight size={16} color={colors.subtle} />
      </Pressable>
      {onSave && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? `Đã lưu ${word.term}` : `Lưu ${word.term}`}
          accessibilityState={{ selected: saved }}
          disabled={saved}
          onPress={onSave}
          style={({ pressed }) => [styles.bookmark, pressed && styles.pressed]}
        >
          <Bookmark
            size={20}
            color={saved ? colors.forest : colors.muted}
            fill={saved ? colors.lime : 'none'}
          />
        </Pressable>
      )}
    </View>
  );
}

