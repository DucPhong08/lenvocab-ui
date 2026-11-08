import { useCallback, useEffect, useRef, useState } from 'react';
import { cardWord } from '@/api/mappers/cardWord';
import { allWords, type Word } from '@/data/scenes';
import type { ScreenProps } from '@/types/screen';
import {
  completeSampleGroup,
  loadSampleProgress,
  resetSampleProgress,
  samplePool,
} from '@/services/learning/sampleProgress';
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
  const ready =
    practiceWords !== undefined || !user || (!loadingData && !dataError);
  const sample =
    practiceWords !== undefined || !user
      ? samplePool(pool, practiceWords !== undefined ? 'practice' : 'guest')
      : null;
  const sampleKey = sample?.key ?? null;
  const latestSample = useRef(sample);
  latestSample.current = sample;
  const latestPool = useRef(pool);
  latestPool.current = pool;
  const [quiz, setQuiz] = useState(() =>
    createQuiz(ready && !sample ? pool : []),
  );
  const waitingForData = useRef(!ready);
  const previousSampleKey = useRef(sampleKey);
  const active = useRef(false);
  const retrying = useRef(false);
  const groupCompleted = useRef(false);
  const [loadingProgress, setLoadingProgress] = useState(!!sample);
  const [sampleComplete, setSampleComplete] = useState(false);
  const [progressError, setProgressError] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<Word[]>([]);
  const [done, setDone] = useState(false);

  const reset = useCallback((nextQuiz: ReturnType<typeof createQuiz>) => {
    setQuiz(nextQuiz);
    setIndex(0);
    setScore(0);
    setMissed([]);
    selectedRef.current = null;
    setSelected(null);
    setDone(false);
    setSampleComplete(false);
    retrying.current = false;
    groupCompleted.current = false;
  }, []);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  useEffect(() => {
    const current = latestSample.current;
    const changed = previousSampleKey.current !== sampleKey;
    previousSampleKey.current = sampleKey;
    if (!current) {
      if (changed || (waitingForData.current && ready)) {
        reset(createQuiz(ready ? latestPool.current : []));
        waitingForData.current = !ready;
      }
      setLoadingProgress(false);
      return;
    }
    let cancelled = false;
    setLoadingProgress(true);
    setProgressError(false);
    reset(createQuiz([]));
    loadSampleProgress(current)
      .then(completed => {
        if (cancelled) return;
        const remaining = latestPool.current.filter(
          word => !completed.includes(word.id),
        );
        const nextQuiz = createQuiz(remaining);
        reset(nextQuiz);
        setSampleComplete(nextQuiz.questions.length === 0);
        setLoadingProgress(false);
      })
      .catch(() => {
        if (cancelled) return;
        reset(createQuiz(latestPool.current));
        setProgressError(true);
        setLoadingProgress(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sampleKey, ready, reset]);

  useEffect(() => {
    if (!selected) return;
    const timer = setTimeout(scrollToEnd, 100);
    return () => clearTimeout(timer);
  }, [selected, scrollToEnd]);

  const isContext = !!quiz.context && index === quiz.questions.length;
  const word = isContext ? quiz.context!.word : quiz.questions[index];
  const options = quiz.optionSets[index] ?? [];
  const total = quiz.questions.length + (quiz.context ? 1 : 0);

  const persist = (job: Promise<unknown>, key: string) => {
    job.catch(() => {
      if (active.current && latestSample.current?.key === key)
        setProgressError(true);
    });
  };
  const answer = (id: string) => {
    if (loadingProgress || selectedRef.current || !word) return;
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
    if (loadingProgress) return;
    const nextQuiz = createQuiz(words);
    if (remainingWords) nextQuiz.remaining = remainingWords;
    reset(nextQuiz);
    retrying.current = remainingWords !== undefined;
    scrollToTop();
  };
  const nextQuestion = () => {
    if (!selectedRef.current || done || loadingProgress) return;
    if (index === total - 1) {
      setDone(true);
      const current = latestSample.current;
      if (current && !retrying.current && !groupCompleted.current) {
        groupCompleted.current = true;
        persist(
          completeSampleGroup(
            current,
            quiz.questions.map(item => item.id),
          ),
          current.key,
        );
      }
    } else {
      setIndex(value => value + 1);
      selectedRef.current = null;
      setSelected(null);
    }
    scrollToTop();
  };
  const restart = () => {
    if (loadingProgress) return;
    const current = latestSample.current;
    if (current) persist(resetSampleProgress(current), current.key);
    start(latestPool.current);
  };

  return {
    done,
    index,
    nextQuestion,
    options,
    questions: quiz.questions,
    restart,
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
    loadingProgress,
    sampleComplete,
    progressError,
  };
}
