import { useEffect, useRef } from 'react';
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
import { useI18n } from '@/i18n';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { LottieAnimation } from '@/components/LottieAnimation';
import celebration from '../../../assets/animations/celebration-confetti.json';
import { SESSION_SIZE } from '@/data/study';
import type { ScreenProps } from '@/types/screen';
import { ContextExercise } from './components/ContextExercise';
import { useStudyExit } from './hooks/useStudyExit';
import { useQuiz } from './hooks/useQuiz';
import { normalize } from './util/quiz';
import { useStyles } from './styles/styles';

export function QuizScreen(props: ScreenProps) {
  const { navigate, practiceWords, loadingData, dataError, reloadData } = props;
  const { styles, colors } = useStyles();
  const { strings, locale } = useI18n();
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
  const playSfx = useSoundEffects();
  const prevDoneRef = useRef(done);

  useEffect(() => {
    if (done && !prevDoneRef.current) {
      playSfx('levelUp');
    }
    prevDoneRef.current = done;
  }, [done, playSfx]);

  const onSelectOption = (optionId: string) => {
    if (selected || !word) return;
    const isCorrect = optionId === word.id;
    playSfx(isCorrect ? 'correct' : 'wrong');
    selectOption(optionId);
  };

  const onAnswerContext = (value: string) => {
    if (selected || !word) return;
    const isCorrect = normalize(value) === normalize(word.term);
    playSfx(isCorrect ? 'correct' : 'wrong');
    answerContext(value);
  };

  const title = practiceWords
    ? locale === 'vi'
      ? 'Luyện từ mẫu'
      : 'Sample Practice'
    : strings.review.quiz;

  if (!word)
    return (
      <>
        <TopBar title={title} onBack={exit} />
        <EmptyState
          loading={loadingData}
          title={
            loadingData
              ? locale === 'vi'
                ? 'Đang chuẩn bị câu hỏi'
                : 'Preparing questions'
              : dataError
              ? strings.review.loadErrorTitle
              : strings.review.noWordsTitle
          }
          description={
            loadingData
              ? strings.review.loadingDescription
              : dataError ?? strings.review.noWordsDescription
          }
          action={
            dataError
              ? strings.common.retry
              : !loadingData
              ? strings.review.scanNewWord
              : undefined
          }
          onPress={dataError ? () => reloadData() : () => navigate('camera')}
        />
      </>
    );

  if (done)
    return (
      <>
        <TopBar title={strings.quiz.topBarResult} onBack={exit} />
        <View style={styles.finish}>
          <LottieAnimation
            source={celebration}
            colorFilters={[
              { keypath: 'Primary', color: colors.primary },
              { keypath: 'Accent', color: colors.accent },
              { keypath: 'Highlight', color: colors.highlight },
              { keypath: 'Badge', color: colors.primaryTint },
              { keypath: 'Star', color: colors.primary },
            ]}
            fallback={
              <View style={styles.finishIcon}>
                <Sparkles size={32} color={colors.primaryText} />
              </View>
            }
          />
          <Eyebrow>{strings.quiz.roundDoneKicker}</Eyebrow>
          <Text style={styles.finishTitle}>
            {missed.length
              ? strings.quiz.tryAgainTitle
              : strings.quiz.wellDoneTitle}
          </Text>
          <Text style={styles.finishDescription}>
            {missed.length
              ? strings.quiz.missedDescription(missed.length)
              : strings.quiz.perfectDescription}
          </Text>
          <View style={styles.score}>
            <Text style={styles.scoreValue}>
              {score}/{total}
            </Text>
            <Text style={styles.scoreCaption}>
              {strings.quiz.correctCountCaption}
            </Text>
          </View>
          {!!missed.length && (
            <View style={styles.missedList}>
              <Eyebrow>{strings.quiz.missedKicker}</Eyebrow>
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
              label={strings.quiz.retryMissed}
              onPress={retryMissed}
              style={styles.stretch}
            />
          )}
          {remaining > 0 ? (
            <PrimaryButton
              label={strings.quiz.practiceMore(
                Math.min(SESSION_SIZE, remaining),
              )}
              onPress={more}
              variant={missed.length ? 'secondary' : 'primary'}
              style={styles.stretch}
            />
          ) : (
            !missed.length && (
              <PrimaryButton
                label={strings.quiz.retrySet}
                onPress={restart}
                style={styles.stretch}
              />
            )
          )}
          <PrimaryButton
            label={strings.quiz.backToReview}
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
        title={isContext ? strings.quiz.contextTitle : strings.quiz.chooseTitle}
        subtitle={
          isContext
            ? strings.quiz.contextSubtitle
            : `${strings.quiz.chooseSubtitle(questions.length)}${
                context ? strings.quiz.plusContext : ''
              }`
        }
      />
      <StudyProgress current={index + 1} total={total} />
      {isContext && context ? (
        <ContextExercise
          word={word}
          sentence={context.sentence}
          answered={!!selected}
          onAnswer={onAnswerContext}
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
                  label={strings.quiz.listenWordAudio}
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
                      ? locale === 'vi'
                        ? ', đáp án đúng'
                        : ', correct answer'
                      : selected && chosen
                      ? locale === 'vi'
                        ? ', chưa đúng'
                        : ', incorrect'
                      : ''
                  }`}
                  disabled={!!selected}
                  onPress={() => onSelectOption(option.id)}
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
              ? strings.quiz.correct
              : locale === 'vi'
              ? `Từ đang luyện là “${word.term}”: ${word.meaning}.`
              : `The target word is "${word.term}": ${word.meaning}.`}
          </Text>
          {isContext && (
            <Text style={styles.feedbackText}>{context?.example}</Text>
          )}
        </View>
      )}
      {(!isContext || selected) && (
        <PrimaryButton
          label={
            index === total - 1
              ? locale === 'vi'
                ? 'Xem kết quả'
                : 'View Results'
              : locale === 'vi'
              ? 'Câu tiếp theo'
              : 'Next Question'
          }
          onPress={nextQuestion}
          disabled={!selected}
          style={styles.actionTop18}
        />
      )}
    </>
  );
}
