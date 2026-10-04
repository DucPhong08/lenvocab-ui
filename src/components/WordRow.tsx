import { Pressable, Text, View } from 'react-native';
import { Bookmark, ChevronRight, Volume2 } from 'lucide-react-native';
import type { Word } from '@/data/scenes';
import { useAudio } from '@/hooks/useAudio';
import { colors } from '@/theme/theme';
import { styles } from './styles/content.styles';

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
  const { play } = useAudio();

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

      {word.audio && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Nghe phát âm từ ${word.term}`}
          onPress={e => {
            e.stopPropagation?.();
            play(word.audio);
          }}
          style={({ pressed }) => [styles.audioRowBtn, pressed && styles.pressed]}
        >
          <Volume2 size={19} color={colors.forest} />
        </Pressable>
      )}

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
