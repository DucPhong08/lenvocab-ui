import { Pressable, Text, View } from 'react-native';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react-native';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import { TopBar } from '@/components/TopBar';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { useFlashcards } from './hooks/useFlashcards';
import { styles } from './styles';

export function FlashcardsScreen({ navigate, user, due, loadingData, submitReview }: ScreenProps) {
  const {
    flip,
    flipped,
    grade,
    index,
    next,
    queue,
    submitting,
    word,
    words,
  } = useFlashcards({ due, loadingData, submitReview, user });
  if (!word) return (
    <View style={styles.page}>
      <TopBar title="Flashcards" onBack={() => navigate('review')} />
      <EmptyState
        title={user && index > 0 ? 'Hoàn thành buổi ôn!' : 'Chưa có từ cần ôn'}
        description={loadingData && queue === null ? 'Đang tải thẻ ôn tập...' : user ? 'Bạn đã ôn hết những từ đến hạn hôm nay.' : 'Khám phá bộ thẻ mẫu để bắt đầu.'}
        onPress={() => navigate('review')}
        action="Trở lại ôn tập"
      />
    </View>
  );
  return (
    <View style={styles.page}>
      <TopBar
        title="Flashcards"
        onBack={() => navigate('review')}
        action={
          <Text style={styles.counter}>
            {index + 1}/{words.length}
          </Text>
        }
      />
      <ScreenTitle
        kicker="LẬT THẺ ĐỂ KHÁM PHÁ"
        title={'Từng từ một,\ntiến xa hơn.'}
      />
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: words.length, now: index + 1 }}
        style={styles.progressTrack}
      >
        <View
          style={[
            styles.progressFill,
            { width: `${((index + 1) / words.length) * 100}%` },
          ]}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          flipped
            ? `Nghĩa là ${word.meaning}. Chạm để xem tiếng Anh`
            : `${word.term}. Chạm để xem nghĩa tiếng Việt`
        }
        onPress={flip}
        style={({ pressed }) => [
          styles.flashcard,
          flipped && styles.flippedCard,
          pressed && { opacity: 0.88 },
        ]}
      >
        <View style={styles.flashcardTop}>
          <Text style={styles.flashcardSmall}>
            {flipped ? 'NGHĨA CỦA TỪ' : `TỪ SỐ ${index + 1}`}
          </Text>
          <Sparkles size={22} color={flipped ? colors.forest : colors.lime} />
        </View>
        <View style={styles.flashcardCenter}>
          <Text style={styles.flashcardType}>
            {flipped ? word.term : word.type}
          </Text>
          <Text
            adjustsFontSizeToFit
            numberOfLines={2}
            style={[styles.flashcardWord, flipped && { color: colors.forest }]}
          >
            {flipped ? word.meaning : word.term}
          </Text>
          <Text
            style={[
              styles.flashcardExample,
              flipped && { color: colors.muted },
            ]}
          >
            {flipped ? word.example : word.ipa}
          </Text>
        </View>
        <View style={styles.flipPrompt}>
          <RotateCcw size={14} color={flipped ? colors.forest : colors.lime} />
          <Text
            style={[styles.flashcardSmall, flipped && { color: colors.forest }]}
          >
            Chạm để lật thẻ
          </Text>
        </View>
      </Pressable>
      <Text style={styles.hint}>
        {flipped
          ? user ? 'Bạn nhớ từ này đến mức nào? Chấm 0–5 để cập nhật lịch ôn.' : 'Sẵn sàng cho từ tiếp theo?'
          : 'Hãy thử nhớ nghĩa của từ trước khi lật nhé.'}
      </Text>
      {user ? (
        <View style={styles.grades}>
          {['Quên sạch', 'Nhớ sai', 'Mơ hồ', 'Khó khăn', 'Nhớ tốt', 'Rất tốt'].map((label, quality) => (
            <Pressable key={quality} accessibilityRole="button" accessibilityLabel={`${quality} điểm: ${label}`} disabled={!flipped || submitting} onPress={() => grade(quality)} style={[styles.grade, (!flipped || submitting) && styles.gradeDisabled]}>
              <Text style={styles.gradeText}>{quality} · {label}</Text>
            </Pressable>
          ))}
        </View>
      ) : <PrimaryButton label="Từ tiếp theo" onPress={next} />}
      <Pressable
        accessibilityRole="button"
        onPress={() => navigate('quiz')}
        style={styles.textAction}
      >
        <Text style={styles.textActionLabel}>Thử sức với Quiz</Text>
        <ArrowRight size={16} color={colors.forest} />
      </Pressable>
    </View>
  );
}
