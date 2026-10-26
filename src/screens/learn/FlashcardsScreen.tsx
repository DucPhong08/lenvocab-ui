import { Pressable, Text, View } from 'react-native';
import { CardImage } from '@/components/CardImage';
import { AudioButton } from '@/components/AudioButton';
import { StudyProgress } from '@/components/StudyProgress';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopBar } from '@/components/TopBar';
import { useAudio } from '@/hooks/useAudio';
import { memoryLevels, SESSION_SIZE } from '@/data/study';
import type { ScreenProps } from '@/types/screen';
import { useFlashcards } from './hooks/useFlashcards';
import { styles } from './styles';

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
  if (!word)
    return (
      <>
        <TopBar title="Ôn nhanh" onBack={() => navigate('review')} />
        <EmptyState
          loading={loading}
          title={
            loading
              ? 'Đang tải thẻ ôn tập'
              : dataError
              ? 'Không thể tải thẻ ôn tập'
              : finished
              ? 'Xong một lượt rồi!'
              : 'Chưa có từ cần ôn'
          }
          description={
            dataError ||
            (loading
              ? 'Đang tải thẻ ôn tập...'
              : finished
              ? `Bạn vừa ôn ${words.length} từ.${
                  user && due.length
                    ? ` Còn ${due.length} từ đến hạn, học tiếp khi bạn sẵn sàng.`
                    : ''
                }`
              : 'Quay lại khi có từ đến hạn, hoặc thử Quiz.')
          }
          action={
            loading ? undefined : dataError ? 'Thử lại' : 'Trở lại ôn tập'
          }
          onPress={dataError ? () => reloadData() : () => navigate('review')}
        />
        {finished && !dataError && (!user || due.length > 0) && (
          <PrimaryButton
            label={
              user
                ? `Ôn thêm ${Math.min(SESSION_SIZE, due.length)} từ`
                : 'Thử lại bộ mẫu'
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
        title="Ôn nhanh"
        onBack={() => navigate('review')}
        action={
          <Text style={styles.counter}>
            {index + 1}/{words.length}
          </Text>
        }
      />
      <StudyProgress current={index + 1} total={words.length} />
      <Text style={styles.hint}>
        {flipped
          ? 'Đọc câu ví dụ. Bạn nhớ từ này đến đâu?'
          : 'Thử nhớ nghĩa trước khi xem đáp án.'}
      </Text>
      <View style={[styles.studyFace, flipped && styles.studyAnswer]}>
        <View style={styles.flashcardTop}>
          <Text style={[styles.flashcardSmall, flipped && styles.answerInk]}>
            {flipped ? 'NGHĨA VÀ CÁCH DÙNG' : `TỪ SỐ ${index + 1}`}
          </Text>
          {(word.audio || word.userFlashcardId) && (
            <AudioButton
              label="Nghe phát âm"
              onPress={() => play(word.audio, word.userFlashcardId)}
              playing={isPlaying}
              light={!flipped}
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
        <PrimaryButton label="Xem nghĩa" onPress={flip} />
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
        <PrimaryButton label="Từ tiếp theo" onPress={next} />
      )}
    </>
  );
}
