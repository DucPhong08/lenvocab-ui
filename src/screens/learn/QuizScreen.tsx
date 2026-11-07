import { Pressable, Text, View } from 'react-native';
import { CheckCircle2, Sparkles, X } from 'lucide-react-native';
import { Eyebrow } from '@/components/Eyebrow';
import { AudioButton } from '@/components/AudioButton';
import { StudyProgress } from '@/components/StudyProgress';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import { TopBar } from '@/components/TopBar';
import { useAudio } from '@/hooks/useAudio';
import { SESSION_SIZE } from '@/data/study';
import type { ScreenProps } from '@/types/screen';
import { ContextExercise } from './components/ContextExercise';
import { useStudyExit } from './hooks/useStudyExit';
import { useQuiz } from './hooks/useQuiz';
import { useStyles } from './styles/styles';

export function QuizScreen(props: ScreenProps) {
  const { navigate, practiceWords, loadingData, dataError, reloadData } = props;
  const { styles, colors } = useStyles();
  const {
    done,
    index,
    nextQuestion,
    options,
    questions,
    restart,
    more,
    retryMissed,
    remaining,
    context,
    isContext,
    total,
    answerContext,
    missed,
    score,
    selected,
    selectOption,
    word,
  } = useQuiz(props);
  const exit = useStudyExit({ navigate, active: !!word && !done });
  const { play, isPlaying } = useAudio();
  const title = practiceWords ? 'Luyện từ mẫu' : 'Quiz nhanh';

  if (!word)
    return (
      <>
        <TopBar title={title} onBack={exit} />
        <EmptyState
          loading={loadingData}
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
          onPress={dataError ? () => reloadData() : () => navigate('camera')}
        />
      </>
    );

  if (done)
    return (
      <>
        <TopBar title="Kết quả luyện tập" onBack={exit} />
        <View style={styles.finish}>
          <View style={styles.finishIcon}>
            <Sparkles size={32} color={colors.primaryText} />
          </View>
          <Eyebrow>XONG MỘT LƯỢT RỒI!</Eyebrow>
          <Text style={styles.finishTitle}>
            {missed.length ? 'Mình thử lại vài từ nhé?' : 'Làm tốt lắm!'}
          </Text>
          <Text style={styles.finishDescription}>
            {missed.length
              ? `${missed.length} từ cần luyện thêm trong lượt này.`
              : 'Bạn đã trả lời đúng tất cả câu trong lượt này.'}
          </Text>
          <View style={styles.score}>
            <Text style={styles.scoreValue}>
              {score}/{total}
            </Text>
            <Text style={styles.scoreCaption}>câu đúng</Text>
          </View>
          {!!missed.length && (
            <View style={styles.missedList}>
              <Eyebrow>TỪ CẦN XEM LẠI</Eyebrow>
              {missed.map(item => (
                <View key={item.id}>
                  <Text style={styles.missedWord}>{item.term}</Text>
                  <Text style={styles.finishDescription}>{item.meaning}</Text>
                </View>
              ))}
            </View>
          )}
          {!!missed.length && (
            <PrimaryButton
              label="Ôn lại từ chưa đúng"
              onPress={retryMissed}
              style={styles.stretch}
            />
          )}
          {remaining > 0 ? (
            <PrimaryButton
              label={`Luyện thêm ${Math.min(SESSION_SIZE, remaining)} từ`}
              onPress={more}
              variant={missed.length ? 'secondary' : 'primary'}
              style={styles.stretch}
            />
          ) : (
            !missed.length && (
              <PrimaryButton
                label="Luyện lại bộ này"
                onPress={restart}
                style={styles.stretch}
              />
            )
          )}
          <PrimaryButton
            label="Quay về ôn tập"
            variant="secondary"
            onPress={exit}
            style={styles.stretch}
          />
        </View>
      </>
    );

  return (
    <>
      <TopBar
        title={title}
        onBack={exit}
        action={
          <Text style={styles.counter}>
            {index + 1}/{total}
          </Text>
        }
      />
      <ScreenTitle
        title={isContext ? 'Dùng từ trong câu' : 'Chọn nghĩa đúng nhé!'}
        subtitle={
          isContext
            ? 'Điền đúng từ hoặc cụm vừa học.'
            : `${questions.length} từ${context ? ' · thêm 1 câu điền từ' : ''}`
        }
      />
      <StudyProgress current={index + 1} total={total} />
      {isContext && context ? (
        <ContextExercise
          word={word}
          sentence={context.sentence}
          answered={!!selected}
          onAnswer={answerContext}
        />
      ) : (
        <>
          <View style={styles.question}>
            <View style={styles.questionWordRow}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={2}
                style={styles.questionWord}
              >
                {word.term}
              </Text>
              {(word.audio || word.userFlashcardId) && (
                <AudioButton
                  label="Nghe phát âm từ"
                  playing={isPlaying}
                  onPress={() => play(word.audio, word.userFlashcardId)}
                />
              )}
            </View>
            {!!word.ipa && <Text style={styles.questionIpa}>{word.ipa}</Text>}
          </View>
          <View style={styles.answerList}>
            {options.map((option, i) => {
              const correct = option.id === word.id;
              const chosen = selected === option.id;
              const letter = String.fromCharCode(65 + i);
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: !!selected,
                    selected: chosen,
                  }}
                  accessibilityLabel={`${letter}. ${option.meaning}${
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
                    <Text style={styles.answerLetterText}>{letter}</Text>
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
        </>
      )}
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
              ? 'Chính xác!'
              : `Từ đang luyện là “${word.term}”: ${word.meaning}.`}
          </Text>
          {isContext && (
            <Text style={styles.feedbackText}>{context?.example}</Text>
          )}
        </View>
      )}
      {(!isContext || selected) && (
        <PrimaryButton
          label={index === total - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
          onPress={nextQuestion}
          disabled={!selected}
          style={styles.actionTop18}
        />
      )}
    </>
  );
}
