import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { ReviewCard } from '@/api/contracts';
import { cardWord } from '@/api/mappers/cardWord';
import { allWords } from '@/data/scenes';
import type { ScreenProps } from '@/types/screen';

export function useFlashcards({
  due,
  loadingData,
  submitReview,
  user,
}: Pick<
  ScreenProps,
  'due' | 'loadingData' | 'submitReview' | 'user'
>) {
  const [queue, setQueue] = useState<ReviewCard[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const reviewAttempt = useRef<{ reviewId: string; quality: number } | null>(
    null,
  );

  useEffect(() => {
    if (user && !loadingData && queue === null) setQueue(due);
  }, [user, loadingData, due, queue]);

  const words = user ? (queue ?? []).map(cardWord) : allWords.slice(0, 4);
  const word = words[index];

  const flip = () => setFlipped(value => !value);
  const next = () => {
    setIndex(value => (value + 1) % words.length);
    setFlipped(false);
  };
  const grade = async (quality: number) => {
    if (!user || !queue?.[index] || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      reviewAttempt.current ??= {
        reviewId: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
          /[xy]/g,
          character => {
            const value = Math.floor(Math.random() * 16);
            return (character === 'x' ? value : (value & 0x3) | 0x8).toString(
              16,
            );
          },
        ),
        quality,
      };
      await submitReview(
        queue[index].user_flashcard_id,
        reviewAttempt.current.quality,
        reviewAttempt.current.reviewId,
      );
      reviewAttempt.current = null;
      setFlipped(false);
      setIndex(value => value + 1);
    } catch (error) {
      Alert.alert(
        'Không thể ghi nhận lần ôn',
        error instanceof Error ? error.message : 'Vui lòng thử lại.',
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return {
    flip,
    flipped,
    grade,
    index,
    next,
    queue,
    submitting,
    word,
    words,
  };
}
