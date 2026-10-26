import { Pressable, Text, View } from 'react-native';
import { Bookmark, ChevronRight } from 'lucide-react-native';
import type { Word } from '@/data/scenes';
import { useAudio } from '@/hooks/useAudio';
import { AudioButton } from './AudioButton';
import { CardImage } from './CardImage';
import { colors } from '@/theme/theme';
import { styles } from './styles/content.styles';

export function WordRow({
  word,
  token,
  saved,
  onOpen,
  onSave,
  disabled = false,
}: {
  word: Word;
  token?: string | null;
  saved: boolean;
  onOpen: () => void;
  onSave?: () => void;
  disabled?: boolean;
}) {
  const { play } = useAudio();

  return (
    <View style={styles.wordRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Xem từ ${word.term}, nghĩa là ${word.meaning}`}
        disabled={disabled}
        accessibilityState={{ disabled }}
        onPress={onOpen}
        style={({ pressed }) => [
          styles.wordMain,
          (pressed || disabled) && styles.pressed,
        ]}
      >
        {word.imageUrl || word.hasImage ? (
          <CardImage
            imageUrl={word.imageUrl}
            isSticker={word.imageStyle === 'sticker'}
            cardId={word.userFlashcardId}
            token={token}
            label={`Ảnh của bạn: ${word.term}`}
            variant="thumbnail"
            fallback={word.term[0].toUpperCase()}
          />
        ) : (
          <View style={styles.wordInitial}>
            <Text style={styles.wordInitialText}>
              {word.term[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.fill}>
          <Text style={styles.wordTerm}>{word.term}</Text>
          <Text style={styles.wordMeaning} numberOfLines={2}>
            {word.type} · {word.meaning}
          </Text>
        </View>
        <ChevronRight size={16} color={colors.subtle} />
      </Pressable>

      {(word.audio || word.userFlashcardId) && (
        <AudioButton
          disabled={disabled}
          label={`Nghe phát âm từ ${word.term}`}
          onPress={() => play(word.audio, word.userFlashcardId)}
        />
      )}

      {onSave && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            saved ? `Đã lưu ${word.term}` : `Lưu ${word.term}`
          }
          accessibilityState={{ selected: saved, disabled: saved || disabled }}
          disabled={saved || disabled}
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
