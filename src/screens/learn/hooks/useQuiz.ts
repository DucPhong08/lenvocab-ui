import { useEffect, useState } from 'react';
import { cardWord } from '@/api/mappers/cardWord';
import { allWords } from '@/data/scenes';
import type { ScreenProps } from '@/types/screen';

export function useQuiz({
  scrollToEnd,
  scrollToTop,
  user,
  cards,
  due,
}: Pick<
  ScreenProps,
  'scrollToEnd' | 'scrollToTop' | 'user' | 'cards' | 'due'
>) {
  const learnedWords = (due.length ? due : cards).map(cardWord);
  const questions =
    user && learnedWords.length ? learnedWords : allWords.slice(0, 4);
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
  const optionPool = [word, ...learnedWords, ...allWords].filter(
    (item, itemIndex, items) =>
      items.findIndex(candidate => candidate.term === item.term) === itemIndex,
  );
  const options = [
    word,
    ...optionPool.filter(item => item.id !== word.id).slice(0, 3),
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
