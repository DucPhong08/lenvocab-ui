import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react-native';
import { CardImage } from '@/components/CardImage';
import { AudioButton } from '@/components/AudioButton';
import { StudyProgress } from '@/components/StudyProgress';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopBar } from '@/components/TopBar';
import { useAudio } from '@/hooks/useAudio';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { colors } from '@/theme/theme';
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
  const { flip, flipped, grade, index, next, queue, submitting, word, words } =
    useFlashcards({ due, loadingData, dataError, submitReview, user });

  const { play, isPlaying } = useAudio();
  const { fontScale } = useWindowDimensions();
  const animatedValue = useRef(new Animated.Value(0)).current;

  const reduceMotion = useReduceMotion();

  // Respect the device motion preference when flipping a card.
  useEffect(() => {
    if (reduceMotion.current) animatedValue.setValue(flipped ? 180 : 0);
    else
      Animated.spring(animatedValue, {
        toValue: flipped ? 180 : 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();

    // Tự động phát âm thanh khi lật sang mặt sau (nghĩa) nếu có audio
    if (flipped && (word?.audio || word?.userFlashcardId)) {
      play(word.audio, word.userFlashcardId);
    }
  }, [
    flipped,
    animatedValue,
    play,
    word?.audio,
    word?.userFlashcardId,
    reduceMotion,
  ]);

  // Reset góc xoay khi chuyển từ mới
  useEffect(() => {
    animatedValue.setValue(0);
  }, [index, animatedValue]);

  if (!word) {
    return (
      <View style={styles.page}>
        <TopBar title="Flashcards" onBack={() => navigate('review')} />
        <EmptyState
          loading={loadingData && queue === null}
          title={
            loadingData && queue === null
              ? 'Đang tải thẻ ôn tập'
              : dataError
              ? 'Không thể tải thẻ ôn tập'
              : user && index > 0
              ? 'Hoàn thành buổi ôn!'
              : 'Chưa có từ cần ôn'
          }
          description={
            dataError
              ? dataError
              : loadingData && queue === null
              ? 'Đang tải thẻ ôn tập...'
              : user
              ? 'Bạn đã ôn hết những từ đến hạn hôm nay.'
              : 'Khám phá bộ thẻ mẫu để bắt đầu.'
          }
          onPress={dataError ? () => reloadData() : () => navigate('review')}
          action={
            loadingData && queue === null
              ? undefined
              : dataError
              ? 'Thử lại'
              : 'Trở lại ôn tập'
          }
        />
      </View>
    );
  }

  // Góc xoay mặt trước (0 -> 180 deg)
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  // Góc xoay mặt sau (180 -> 360 deg)
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ perspective: 1000 }, { rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ perspective: 1000 }, { rotateY: backInterpolate }],
  };

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
      <Text style={styles.hint}>Nhớ nghĩa, rồi chạm để lật thẻ.</Text>
      <StudyProgress current={index + 1} total={words.length} />

      {/* 3D Flip Card Container */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          flipped
            ? `Nghĩa là ${word.meaning}. Chạm để xem tiếng Anh`
            : `${word.term}. Chạm để xem nghĩa tiếng Việt`
        }
        disabled={submitting}
        accessibilityState={{ disabled: submitting, busy: submitting }}
        onPress={flip}
        style={[
          styles.flashcardContainer,
          {
            height:
              Math.ceil(340 * Math.max(1, fontScale)) +
              (word.imageUrl || word.hasImage ? 100 : 0),
          },
        ]}
      >
        {/* Mặt trước: Từ tiếng Anh + Phiên âm */}
        <Animated.View
          accessibilityElementsHidden={flipped}
          importantForAccessibility={flipped ? 'no-hide-descendants' : 'auto'}
          pointerEvents={flipped ? 'none' : 'auto'}
          style={[styles.cardFront, frontAnimatedStyle]}
        >
          <View style={styles.flashcardTop}>
            <Text style={styles.flashcardSmall}>TỪ SỐ {index + 1}</Text>
            <View style={styles.cardTopActions}>
              {(word.audio || word.userFlashcardId) && (
                <AudioButton
                  label="Phát âm tiếng Anh chuẩn"
                  onPress={() => play(word.audio, word.userFlashcardId)}
                  playing={isPlaying}
                  light
                />
              )}
              <Sparkles size={22} color={colors.lime} />
            </View>
          </View>

          <View style={styles.flashcardCenter}>
            {(word.imageUrl || word.hasImage) && (
              <CardImage
                imageUrl={word.imageUrl}
                isSticker={word.imageStyle === 'sticker'}
                cardId={word.userFlashcardId}
                token={token}
                label={`Ảnh của bạn: ${word.term}`}
                variant="flashcard"
              />
            )}
            <Text style={styles.flashcardType}>{word.type}</Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={2}
              style={styles.flashcardWord}
            >
              {word.term}
            </Text>
            <Text style={styles.flashcardExample}>{word.ipa}</Text>
            {word.repetitions !== undefined && word.repetitions > 0 && (
              <View style={styles.sm2Badge}>
                <Text style={styles.sm2BadgeText}>
                  Đã ôn {word.repetitions} lần · Lặp lại sau{' '}
                  {word.interval ?? 1} ngày
                </Text>
              </View>
            )}
          </View>

          <View style={styles.flipPrompt}>
            <RotateCcw size={14} color={colors.lime} />
            <Text style={styles.flashcardSmall}>Chạm để lật thẻ</Text>
          </View>
        </Animated.View>

        {/* Mặt sau: Giải nghĩa tiếng Việt + Câu ví dụ */}
        <Animated.View
          accessibilityElementsHidden={!flipped}
          importantForAccessibility={!flipped ? 'no-hide-descendants' : 'auto'}
          pointerEvents={!flipped ? 'none' : 'auto'}
          style={[styles.cardBack, backAnimatedStyle]}
        >
          <View style={styles.flashcardTop}>
            <Text style={[styles.flashcardSmall, { color: colors.forest }]}>
              NGHĨA CỦA TỪ
            </Text>
            <View style={styles.cardTopActions}>
              {(word.audio || word.userFlashcardId) && (
                <AudioButton
                  label="Nghe lại phát âm"
                  onPress={() => play(word.audio, word.userFlashcardId)}
                  playing={isPlaying}
                />
              )}
              <Sparkles size={22} color={colors.forest} />
            </View>
          </View>

          <View style={styles.flashcardCenter}>
            <Text style={[styles.flashcardType, { color: colors.forest }]}>
              {word.term}
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={2}
              style={[styles.flashcardWord, { color: colors.forest }]}
            >
              {word.meaning}
            </Text>
            <Text style={[styles.flashcardExample, { color: colors.muted }]}>
              {word.example}
            </Text>
          </View>

          <View style={styles.flipPrompt}>
            <RotateCcw size={14} color={colors.forest} />
            <Text style={[styles.flashcardSmall, { color: colors.forest }]}>
              Chạm để lật lại tiếng Anh
            </Text>
          </View>
        </Animated.View>
      </Pressable>

      <Text style={styles.hint}>
        {flipped
          ? user
            ? 'Bạn nhớ từ này đến mức nào? Chọn mức phù hợp để hẹn lần ôn sau.'
            : 'Sẵn sàng cho từ tiếp theo?'
          : 'Hãy thử nhớ nghĩa của từ trước khi lật nhé.'}
      </Text>

      {user ? (
        <View style={styles.grades}>
          {[
            'Quên sạch',
            'Nhớ sai',
            'Mơ hồ',
            'Khó khăn',
            'Nhớ tốt',
            'Rất tốt',
          ].map((label, quality) => (
            <Pressable
              key={quality}
              accessibilityRole="button"
              accessibilityLabel={`${quality} điểm: ${label}`}
              accessibilityState={{ disabled: !flipped || submitting }}
              disabled={!flipped || submitting}
              onPress={() => grade(quality)}
              style={[
                styles.grade,
                (!flipped || submitting) && styles.gradeDisabled,
              ]}
            >
              <Text style={styles.gradeText}>
                {quality} · {label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <PrimaryButton label="Từ tiếp theo" onPress={next} />
      )}

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
