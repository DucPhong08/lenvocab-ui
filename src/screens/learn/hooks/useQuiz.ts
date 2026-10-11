import { useEffect, useRef, useState } from 'react';
import { cardWord } from '@/api/mappers/cardWord';
import { allWords, type Word } from '@/data/scenes';
import type { ScreenProps } from '@/types/screen';

function shuffledOptions(word: Word, learnedWords: Word[]) {
  const uniqueWords = [word, ...learnedWords, ...allWords].filter(
    (item, index, items) =>
      items.findIndex(candidate => candidate.term === item.term) === index,
  );
  const options = [
    word,
    ...uniqueWords.filter(item => item.id !== word.id).slice(0, 3),
  ];

  for (let index = options.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [options[index], options[target]] = [options[target], options[index]];
  }
  return options;
}

function createQuiz(user: ScreenProps['user'], learnedWords: Word[]) {
  const questions = user ? learnedWords : allWords.slice(0, 4);
  return {
    questions,
    optionSets: questions.map(word => shuffledOptions(word, learnedWords)),
  };
}

export function useQuiz({
  scrollToEnd,
  scrollToTop,
  user,
  cards,
  due,
  loadingData,
  dataError,
}: Pick<
  ScreenProps,
  | 'scrollToEnd'
  | 'scrollToTop'
  | 'user'
  | 'cards'
  | 'due'
  | 'loadingData'
  | 'dataError'
>) {
  const learnedWords = (due.length ? due : cards).map(cardWord);
  const [quiz, setQuiz] = useState(() =>
    loadingData || dataError
      ? { questions: [], optionSets: [] }
      : createQuiz(user, learnedWords),
  );
  const waitingForData = useRef(loadingData || !!dataError);
  const latestQuizData = useRef({ user, learnedWords });
  latestQuizData.current = { user, learnedWords };
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (waitingForData.current && !loadingData && !dataError) {
      setQuiz(
        createQuiz(
          latestQuizData.current.user,
          latestQuizData.current.learnedWords,
        ),
      );
      waitingForData.current = false;
    }
  }, [dataError, loadingData]);

  useEffect(() => {
    if (selected) {
      const timer = setTimeout(scrollToEnd, 100);
      return () => clearTimeout(timer);
    }
  }, [selected, scrollToEnd]);

  const currentIndex = Math.min(index, quiz.questions.length - 1);
  const word = quiz.questions[currentIndex];
  const options = quiz.optionSets[currentIndex] ?? [];

  const selectOption = (id: string) => {
    if (selectedRef.current || !word) return;
    selectedRef.current = id;
    setSelected(id);
    if (id === word.id) setScore(value => value + 1);
  };
  const restart = () => {
    setQuiz(createQuiz(user, learnedWords));
    setIndex(0);
    setScore(0);
    selectedRef.current = null;
    setSelected(null);
    setDone(false);
    scrollToTop();
  };
  const nextQuestion = () => {
    if (!selectedRef.current) return;
    if (currentIndex === quiz.questions.length - 1) {
      setDone(true);
      scrollToTop();
      return;
    }
    setIndex(value => value + 1);
    selectedRef.current = null;
    setSelected(null);
    scrollToTop();
  };

  return {
    done,
    index: currentIndex,
    nextQuestion,
    options,
    questions: quiz.questions,
    restart,
    score,
    selected,
    selectOption,
    word,
  };
}
