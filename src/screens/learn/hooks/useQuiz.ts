import { useEffect, useRef, useState } from 'react';
import { cardWord } from '@/api/mappers/cardWord';
import { allWords, type Word } from '@/data/scenes';
import type { ScreenProps } from '@/types/screen';
import { createQuiz, normalize } from '../util/quiz';

export function useQuiz({
  scrollToEnd,
  scrollToTop,
  user,
  cards,
  due,
  loadingData,
  dataError,
  practiceWords,
}: Pick<
  ScreenProps,
  | 'scrollToEnd'
  | 'scrollToTop'
  | 'user'
  | 'cards'
  | 'due'
  | 'loadingData'
  | 'dataError'
  | 'practiceWords'
>) {
  const pool =
    practiceWords ??
    (user ? (due.length ? due : cards).map(cardWord) : allWords);
  const ready = practiceWords !== undefined || (!loadingData && !dataError);
  const [quiz, setQuiz] = useState(() => createQuiz(ready ? pool : []));
  const waitingForData = useRef(!ready);
  const latestPool = useRef(pool);
  latestPool.current = pool;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<Word[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (waitingForData.current && ready) {
      setQuiz(createQuiz(latestPool.current));
      waitingForData.current = false;
    }
  }, [ready]);

  useEffect(() => {
    if (!selected) return;
    const timer = setTimeout(scrollToEnd, 100);
    return () => clearTimeout(timer);
  }, [selected, scrollToEnd]);

  const isContext = !!quiz.context && index === quiz.questions.length;
  const word = isContext ? quiz.context!.word : quiz.questions[index];
  const options = quiz.optionSets[index] ?? [];
  const total = quiz.questions.length + (quiz.context ? 1 : 0);

  const answer = (id: string) => {
    if (selectedRef.current || !word) return;
    selectedRef.current = id;
    setSelected(id);
    if (id === word.id) setScore(value => value + 1);
    else
      setMissed(words =>
        words.some(item => item.id === word.id) ? words : [...words, word],
      );
  };
  const selectOption = (id: string) => {
    if (!isContext && options.some(option => option.id === id)) answer(id);
  };
  const answerContext = (value: string) => {
    if (!isContext || !normalize(value)) return;
    answer(
      normalize(value) === normalize(word.term) ? word.id : 'incorrect-context',
    );
  };
  const start = (words: Word[], remainingWords?: Word[]) => {
    const nextQuiz = createQuiz(words);
    if (remainingWords) nextQuiz.remaining = remainingWords;
    setQuiz(nextQuiz);
    setIndex(0);
    setScore(0);
    setMissed([]);
    selectedRef.current = null;
    setSelected(null);
    setDone(false);
    scrollToTop();
  };
  const nextQuestion = () => {
    if (!selectedRef.current || done) return;
    if (index === total - 1) setDone(true);
    else {
      setIndex(value => value + 1);
      selectedRef.current = null;
      setSelected(null);
    }
    scrollToTop();
  };

  return {
    done,
    index,
    nextQuestion,
    options,
    questions: quiz.questions,
    restart: () => start(latestPool.current),
    more: () => start(quiz.remaining),
    retryMissed: () => start(missed, quiz.remaining),
    remaining: quiz.remaining.length,
    context: quiz.context,
    isContext,
    total,
    answerContext,
    missed,
    score,
    selected,
    selectOption,
    word,
  };
}
