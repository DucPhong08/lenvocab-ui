import { useEffect, useState } from 'react';
import { allWords } from '@/data/scenes';
import type { ScreenProps } from '@/types/screen';

export function useQuiz({
  scrollToEnd,
  scrollToTop,
}: Pick<ScreenProps, 'scrollToEnd' | 'scrollToTop'>) {
  const questions = allWords.slice(0, 4);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (selected) {
      const timer = setTimeout(scrollToEnd, 100);
      return () => clearTimeout(timer);
    }
  }, [selected, scrollToEnd]);

  const word = questions[index];
  const options = [
    word,
    questions[(index + 1) % 4],
    questions[(index + 2) % 4],
    questions[(index + 3) % 4],
  ].sort(
    (first, second) =>
      (first.id.charCodeAt(0) % 5) - (second.id.charCodeAt(0) % 5),
  );

  const selectOption = (id: string) => {
    setSelected(id);
    if (id === word.id) setScore(value => value + 1);
  };
  const restart = () => {
    setIndex(0);
    setScore(0);
    setSelected(null);
    setDone(false);
    scrollToTop();
  };
  const nextQuestion = () => {
    if (!selected) return;
    if (index === questions.length - 1) {
      setDone(true);
      scrollToTop();
      return;
    }
    setIndex(value => value + 1);
    setSelected(null);
    scrollToTop();
  };

  return {
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
  };
}
