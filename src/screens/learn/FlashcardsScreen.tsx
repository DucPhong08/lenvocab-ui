import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { ArrowRight, RotateCcw, Sparkles, Volume2 } from 'lucide-react-native';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import { TopBar } from '@/components/TopBar';
import { useAudio } from '@/hooks/useAudio';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { useFlashcards } from './hooks/useFlashcards';
import { styles } from './styles';

export function FlashcardsScreen({
  navigate,
  user,
  due,
  loadingData,
  submitReview,
  dataError,
  reloadData,
}: ScreenProps) {
  const { flip, flipped, grade, index, next, queue, submitting, word, words } =
    useFlashcards({ due, loadingData, submitReview, user });

  const { play, isPlaying } = useAudio();
  const animatedValue = useRef(new Animated.Value(0)).current;

  // 3D Flip animation
  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: flipped ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    // Tự động phát âm thanh khi lật sang mặt sau (nghĩa) nếu có audio
    if (flipped && word?.audio) {
      play(word.audio);
    }
  }, [flipped, animatedValue, play, word?.audio]);

  // Reset góc xoay khi chuyển từ mới
  useEffect(() => {
    animatedValue.setValue(0);
  }, [index, animatedValue]);

  if (!word) {
    return (
      <View style={styles.page}>
        <TopBar title="Flashcards" onBack={() => navigate('review')} />
        <EmptyState
          title={
            dataError
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
          action={dataError ? 'Thử lại' : 'Trở lại ôn tập'}
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

      {/* 3D Flip Card Container */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          flipped
            ? `Nghĩa là ${word.meaning}. Chạm để xem tiếng Anh`
            : `${word.term}. Chạm để xem nghĩa tiếng Việt`
        }
        onPress={flip}
        style={styles.flashcardContainer}
      >
        {/* Mặt trước: Từ tiếng Anh + Phiên âm */}
        <Animated.View style={[styles.cardFront, frontAnimatedStyle]}>
          <View style={styles.flashcardTop}>
            <Text style={styles.flashcardSmall}>TỪ SỐ {index + 1}</Text>
            <View style={styles.cardTopActions}>
              {word.audio && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Phát âm tiếng Anh chuẩn"
                  onPress={e => {
                    e.stopPropagation?.();
                    play(word.audio);
                  }}
                  style={[
                    styles.speakerBtn,
                    isPlaying && styles.speakerBtnPlaying,
                  ]}
                >
                  <Volume2 size={18} color={colors.lime} />
                </Pressable>
              )}
              <Sparkles size={22} color={colors.lime} />
            </View>
          </View>

          <View style={styles.flashcardCenter}>
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
        <Animated.View style={[styles.cardBack, backAnimatedStyle]}>
          <View style={styles.flashcardTop}>
            <Text style={[styles.flashcardSmall, { color: colors.forest }]}>
              NGHĨA CỦA TỪ
            </Text>
            <View style={styles.cardTopActions}>
              {word.audio && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Nghe lại phát âm"
                  onPress={e => {
                    e.stopPropagation?.();
                    play(word.audio);
                  }}
                  style={[
                    styles.speakerBtnBack,
                    isPlaying && styles.speakerBtnPlaying,
                  ]}
                >
                  <Volume2 size={18} color={colors.forest} />
                </Pressable>
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
            ? 'Bạn nhớ từ này đến mức nào? Chấm 0–5 để thuật toán SM-2 cập nhật lịch ôn.'
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
