import { Pressable, Text, View } from 'react-native';
import { CheckCircle2, Sparkles, Volume2, X } from 'lucide-react-native';
import { Eyebrow } from '@/components/Eyebrow';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import { TopBar } from '@/components/TopBar';
import { useAudio } from '@/hooks/useAudio';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { useQuiz } from './hooks/useQuiz';
import { styles } from './styles';

export function QuizScreen({
  navigate,
  scrollToEnd,
  scrollToTop,
  user,
  cards,
  due,
  loadingData,
  dataError,
  reloadData,
}: ScreenProps) {
  const {
    done,
    index,
    nextQuestion,
    options,
    questions,
    restart,
    score,
    selected,
    selectOption,
    word,
  } = useQuiz({
    scrollToEnd,
    scrollToTop,
    user,
    cards,
    due,
    loadingData,
    dataError,
  });
  const { play } = useAudio();
  if (loadingData || dataError || !word) {
    return (
      <View style={styles.page}>
        <TopBar title="Quiz nhanh" onBack={() => navigate('review')} />
        <EmptyState
          title={
            loadingData
              ? 'Đang chuẩn bị câu hỏi'
              : dataError
              ? 'Không thể tải câu hỏi'
              : 'Chưa có từ để luyện tập'
          }
          description={
            loadingData
              ? 'Vui lòng chờ trong giây lát.'
              : dataError ?? 'Quét và lưu từ đầu tiên để bắt đầu quiz.'
          }
          action={
            dataError ? 'Thử lại' : !loadingData ? 'Quét từ mới' : undefined
          }
          onPress={
            dataError
              ? () => reloadData()
              : !loadingData
              ? () => navigate('camera')
              : undefined
          }
        />
      </View>
    );
  }
  if (done)
    return (
      <View style={styles.page}>
        <TopBar title="Kết quả Quiz" onBack={() => navigate('review')} />
        <View style={styles.finish}>
          <View style={styles.finishIcon}>
            <Sparkles size={32} color={colors.forest} />
          </View>
          <Eyebrow>HOÀN THÀNH RỒI</Eyebrow>
          <Text style={styles.finishTitle}>Bạn làm tốt lắm!</Text>
          <Text style={styles.finishDescription}>
            Mỗi lần thử là một lần bạn nhớ từ lâu hơn.
          </Text>
          <View style={styles.score}>
            <Text style={styles.scoreValue}>
              {score}/{questions.length}
            </Text>
            <Text style={styles.scoreCaption}>câu đúng</Text>
          </View>
          <PrimaryButton
            label="Thử lại"
            onPress={restart}
            style={styles.stretch}
          />
          <PrimaryButton
            label="Quay về ôn tập"
            variant="secondary"
            onPress={() => navigate('review')}
            style={styles.stretch}
          />
        </View>
      </View>
    );
  return (
    <View style={styles.page}>
      <TopBar
        title="Quiz nhanh"
        onBack={() => navigate('review')}
        action={
          <Text style={styles.counter}>
            {index + 1}/{questions.length}
          </Text>
        }
      />
      <ScreenTitle
        kicker={`CÂU HỎI ${index + 1}`}
        title="Từ này có nghĩa là gì?"
        subtitle="Chọn đáp án đúng nhất nhé."
      />
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: questions.length, now: index + 1 }}
        style={styles.progressTrack}
      >
        <View
          style={[
            styles.progressFill,
            { width: `${((index + 1) / questions.length) * 100}%` },
          ]}
        />
      </View>
      <View style={styles.question}>
        <Text style={styles.questionLabel}>ENGLISH WORD</Text>
        <View style={styles.questionWordRow}>
          <Text style={styles.questionWord}>{word.term}</Text>
          {word.audio && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Nghe phát âm từ"
              onPress={() => play(word.audio)}
              style={styles.speakerBtn}
            >
              <Volume2 size={18} color={colors.lime} />
            </Pressable>
          )}
        </View>
        <Text style={styles.questionIpa}>{word.ipa}</Text>
      </View>
      <View style={styles.answerList}>
        {options.map((option, i) => {
          const correct = option.id === word.id;
          const chosen = selected === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ disabled: !!selected, selected: chosen }}
              accessibilityLabel={`${String.fromCharCode(65 + i)}. ${
                option.meaning
              }${
                selected && correct
                  ? ', đáp án đúng'
                  : selected && chosen
                  ? ', chưa đúng'
                  : ''
              }`}
              disabled={!!selected}
              onPress={() => selectOption(option.id)}
              style={[
                styles.answer,
                selected && correct && styles.answerCorrect,
                selected && chosen && !correct && styles.answerWrong,
              ]}
            >
              <View style={styles.answerLetter}>
                <Text style={styles.answerLetterText}>
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text style={styles.answerText}>{option.meaning}</Text>
              {selected && correct && (
                <CheckCircle2 size={21} color={colors.success} />
              )}
              {selected && chosen && !correct && (
                <X size={21} color={colors.error} />
              )}
            </Pressable>
          );
        })}
      </View>
      {selected && (
        <View
          accessibilityLiveRegion="polite"
          style={[
            styles.feedback,
            selected === word.id && styles.feedbackCorrect,
          ]}
        >
          <Text style={styles.feedbackText}>
            {selected === word.id
              ? 'Chính xác! Bạn đang làm rất tốt.'
              : `Gần đúng rồi! “${word.term}” nghĩa là “${word.meaning}”.`}
          </Text>
        </View>
      )}
      <PrimaryButton
        label={index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
        onPress={nextQuestion}
        disabled={!selected}
        style={styles.actionTop18}
      />
    </View>
  );
}
