import { Pressable, Text, View } from 'react-native';
import { CardImage } from '@/components/CardImage';
import { AudioButton } from '@/components/AudioButton';
import { StudyProgress } from '@/components/StudyProgress';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopBar } from '@/components/TopBar';
import { useAudio } from '@/hooks/useAudio';
import { useI18n } from '@/i18n';
import { playSfx } from '@/utils/sfx';
import { memoryLevels, SESSION_SIZE } from '@/data/study';
import type { ScreenProps } from '@/types/screen';
import { useStudyExit } from './hooks/useStudyExit';
import { useFlashcards } from './hooks/useFlashcards';
import { useStyles } from './styles/styles';

export function FlashcardsScreen({
  navigate,
  token,
  user,
  due,
  loadingData,
  submitReview,
  dataError,
  reloadData,
}: ScreenProps) {
  const { styles } = useStyles();
  const { strings } = useI18n();
  const {
    flip,
    flipped,
    grade,
    index,
    next,
    queue,
    restart,
    submitting,
    word,
    words,
  } = useFlashcards({ due, loadingData, dataError, submitReview, user });
  const { play, isPlaying } = useAudio();
  const loading = loadingData && queue === null;
  const finished = index > 0 && !word;
  const exit = useStudyExit({ navigate, active: !!word, busy: submitting });

  const onFlip = () => {
    playSfx('flip');
    flip();
  };
  if (!word)
    return (
      <>
        <TopBar title={strings.flashcards.topBarTitle} onBack={exit} />
        <EmptyState
          loading={loading}
          title={
            loading
              ? strings.flashcards.loadingTitle
              : dataError
              ? strings.flashcards.loadErrorTitle
              : finished
              ? strings.flashcards.finishedRound
              : strings.flashcards.noWordsDue
          }
          description={
            dataError ||
            (loading
              ? strings.flashcards.loadingDescription
              : finished
              ? `${strings.flashcards.reviewedCount(words.length)}${
                  user && due.length
                    ? strings.flashcards.remainingDue(due.length)
                    : ''
                }`
              : strings.flashcards.comeBackLater)
          }
          action={
            loading ? undefined : dataError ? strings.common.retry : strings.flashcards.backToReview
          }
          onPress={dataError ? () => reloadData() : () => navigate('review')}
        />
        {finished && !dataError && (!user || due.length > 0) && (
          <PrimaryButton
            label={
              user
                ? strings.flashcards.reviewMore(Math.min(SESSION_SIZE, due.length))
                : strings.flashcards.retrySample
            }
            onPress={restart}
            style={styles.actionTop20}
          />
        )}
      </>
    );
  return (
    <>
      <TopBar
        title={strings.flashcards.topBarTitle}
        onBack={exit}
        action={
          <Text style={styles.counter}>
            {index + 1}/{words.length}
          </Text>
        }
      />
      <StudyProgress current={index + 1} total={words.length} />
      <Text style={styles.hint}>
        {flipped
          ? strings.flashcards.hintAnswer
          : strings.flashcards.hintQuestion}
      </Text>
      <View style={[styles.studyFace, flipped && styles.studyAnswer]}>
        <View style={styles.flashcardTop}>
          <Text style={[styles.flashcardSmall, flipped && styles.answerInk]}>
            {flipped ? strings.flashcards.meaningAndUsage : strings.flashcards.wordNumber(index + 1)}
          </Text>
          {(word.audio || word.userFlashcardId) && (
            <AudioButton
              label={strings.flashcards.listenAudio}
              onPress={() => play(word.audio, word.userFlashcardId)}
              playing={isPlaying}
            />
          )}
        </View>
        {!flipped && (word.imageUrl || word.hasImage) && (
          <CardImage
            imageUrl={word.imageUrl}
            isSticker={word.imageStyle === 'sticker'}
            cardId={word.userFlashcardId}
            token={token}
            label={`Ảnh của bạn: ${word.term}`}
            variant="flashcard"
          />
        )}
        <Text style={[styles.flashcardWord, flipped && styles.answerInk]}>
          {word.term}
        </Text>
        {!!word.ipa && (
          <Text style={[styles.flashcardExample, flipped && styles.answerInk]}>
            {word.ipa}
          </Text>
        )}
        {flipped && (
          <>
            <Text style={styles.answerMeaning}>{word.meaning}</Text>
            <Text style={styles.answerExample}>{word.example}</Text>
          </>
        )}
      </View>
      {!flipped ? (
        <PrimaryButton label={strings.flashcards.viewMeaning} onPress={onFlip} />
      ) : user ? (
        <View style={styles.grades}>
          {memoryLevels.map(({ label, quality }) => (
            <Pressable
              key={quality}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ disabled: submitting, busy: submitting }}
              disabled={submitting}
              onPress={() => grade(quality)}
              style={[styles.grade, submitting && styles.gradeDisabled]}
            >
              <Text style={styles.gradeText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <PrimaryButton label={strings.common.continue} onPress={next} />
      )}
    </>
  );
}
