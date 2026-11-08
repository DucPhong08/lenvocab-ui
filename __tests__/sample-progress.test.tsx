import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import RNFS from 'react-native-fs';
import { allWords, type Word } from '@/data/scenes';
import type { Flashcard, User } from '@/api/contracts';
import { useQuiz } from '@/screens/learn/hooks/useQuiz';
import {
  completeSampleGroup,
  loadSampleProgress,
  resetSampleProgress,
  samplePool,
} from '@/services/learning/sampleProgress';

jest.mock('react-native-fs');
const files = (RNFS as typeof RNFS & { __files: Map<string, string> }).__files;
const firstPool = allWords.slice(0, 25);
const account = { id: 'account' } as User;

beforeEach(() => {
  files.clear();
  jest.clearAllMocks();
});

async function session(overrides: Partial<Parameters<typeof useQuiz>[0]> = {}) {
  let state!: ReturnType<typeof useQuiz>;
  const Harness = () => {
    state = useQuiz({
      cards: [],
      due: [],
      user: null,
      loadingData: false,
      dataError: null,
      scrollToEnd: jest.fn(),
      scrollToTop: jest.fn(),
      ...overrides,
    });
    return null;
  };
  let renderer!: Renderer.ReactTestRenderer;
  await act(async () => {
    renderer = Renderer.create(<Harness />);
  });
  return {
    get state() {
      return state;
    },
    async close() {
      await act(async () => renderer.unmount());
    },
  };
}

type Session = Awaited<ReturnType<typeof session>>;
async function finish(current: Session, missFirst = false) {
  let first = true;
  while (!current.state.done) {
    await act(async () => {
      if (current.state.isContext) {
        current.state.answerContext(current.state.word.term);
      } else {
        const id =
          missFirst && first
            ? current.state.options.find(
                item => item.id !== current.state.word.id,
              )!.id
            : current.state.word.id;
        current.state.selectOption(id);
      }
    });
    await act(async () => current.state.nextQuestion());
    first = false;
  }
}
const ids = (words: Word[]) => words.map(word => word.id);

test('completed sample groups survive leaving and remounting; unfinished groups do not advance', async () => {
  let current = await session({ practiceWords: firstPool });
  expect(ids(current.state.questions)).toEqual(ids(firstPool.slice(0, 10)));
  await act(async () => current.state.selectOption(current.state.word.id));
  await current.close();
  current = await session({ practiceWords: firstPool });
  expect(current.state.index).toBe(0);
  expect(ids(current.state.questions)).toEqual(ids(firstPool.slice(0, 10)));
  await finish(current);
  await current.close();
  current = await session({ practiceWords: firstPool });
  expect(ids(current.state.questions)).toEqual(ids(firstPool.slice(10, 20)));
  expect(current.state.remaining).toBe(5);
  await current.close();
});

test('pool order, selected levels and guest practice have independent progress; restart resets only its pool', async () => {
  let current = await session({ practiceWords: firstPool });
  await finish(current);
  await current.close();
  const other = [...firstPool.slice(10), ...firstPool.slice(0, 10)];
  current = await session({ practiceWords: other });
  expect(ids(current.state.questions)).toEqual(ids(other.slice(0, 10)));
  await current.close();
  current = await session({
    practiceWords: firstPool.filter(word => word.level === 'A1'),
  });
  expect(current.state.questions[0].id).toBe(
    firstPool.find(word => word.level === 'A1')!.id,
  );
  await current.close();
  current = await session();
  expect(ids(current.state.questions)).toEqual(ids(allWords.slice(0, 10)));
  await current.close();
  current = await session({ practiceWords: firstPool });
  await act(async () => current.state.restart());
  expect(ids(current.state.questions)).toEqual(ids(firstPool.slice(0, 10)));
  await current.close();
  current = await session({ practiceWords: firstPool });
  expect(ids(current.state.questions)).toEqual(ids(firstPool.slice(0, 10)));
  await current.close();
});

test('retrying missed samples keeps the next group and never marks extra words completed', async () => {
  let current = await session({ practiceWords: firstPool });
  await finish(current, true);
  expect(current.state.missed).toHaveLength(1);
  await act(async () => current.state.retryMissed());
  expect(current.state.questions).toHaveLength(1);
  expect(current.state.remaining).toBe(15);
  await finish(current);
  await act(async () => current.state.more());
  expect(ids(current.state.questions)).toEqual(ids(firstPool.slice(10, 20)));
  await finish(current);
  await current.close();
  current = await session({ practiceWords: firstPool });
  expect(ids(current.state.questions)).toEqual(ids(firstPool.slice(20)));
  await current.close();
});

test('finishing the entire sample pool stays completed until an explicit restart', async () => {
  const pool = allWords.slice(0, 12);
  let current = await session({ practiceWords: pool });
  await finish(current);
  await act(async () => current.state.more());
  await finish(current);
  await current.close();
  current = await session({ practiceWords: pool });
  expect(current.state.sampleComplete).toBe(true);
  expect(current.state.questions).toHaveLength(0);
  await act(async () => current.state.restart());
  expect(current.state.sampleComplete).toBe(false);
  expect(ids(current.state.questions)).toEqual(ids(pool.slice(0, 10)));
  await current.close();
});

test('account cards and due queues do not read or write sample progress', async () => {
  const cards = firstPool.slice(0, 2).map<Flashcard>(word => ({
    user_flashcard_id: `private-${word.id}`,
    global_flashcard_id: `global-${word.id}`,
    keyword: word.term,
    meaning_vi: word.meaning,
    example_1: word.example,
    example_2: word.example2 ?? word.example,
    status: 'CONFIRMED',
    interval: 1,
    repetitions: 0,
    efactor: 2.5,
    next_review_date: '2026-11-08',
    related_words: [],
    pronunciation: null,
    audio_base64: null,
  }));
  let current = await session({ user: account, cards });
  await finish(current);
  await current.close();
  expect(RNFS.exists).not.toHaveBeenCalled();
  expect(RNFS.writeFile).not.toHaveBeenCalled();
  current = await session({ user: account, due: cards });
  expect(current.state.questions[0].id).toBe(cards[0].user_flashcard_id);
  await current.close();
  expect(RNFS.exists).not.toHaveBeenCalled();
});

test('serialized completions, resets and loads preserve their order without leaking personal fields', async () => {
  const pool = samplePool(firstPool, 'practice')!;
  await Promise.all([
    completeSampleGroup(pool, ids(firstPool.slice(0, 10))),
    completeSampleGroup(pool, ids(firstPool.slice(10, 20))),
  ]);
  expect(await loadSampleProgress(pool)).toEqual(ids(firstPool.slice(0, 20)));
  const reset = resetSampleProgress(pool);
  const load = loadSampleProgress(pool);
  await reset;
  expect(await load).toEqual([]);
  const record = JSON.parse([...files.values()][0]);
  expect(Object.keys(record).sort()).toEqual([
    'completed',
    'ids',
    'revision',
    'version',
  ]);
});

test('corrupt, oversized and mismatched records never supply completion IDs; interrupted writes keep a valid slot', async () => {
  const pool = samplePool(firstPool, 'practice')!;
  const path = `/private/lenvocab-sample-progress/${pool.key}.0.json`;
  for (const content of [
    '{broken',
    ' '.repeat(256_001),
    JSON.stringify({
      version: 1,
      revision: 2,
      ids: pool.ids,
      completed: ['foreign-id'],
    }),
    JSON.stringify({
      version: 1,
      revision: 2,
      ids: pool.ids.slice(1),
      completed: [pool.ids[0]],
    }),
  ]) {
    files.set(path, content);
    expect(await loadSampleProgress(pool)).toEqual([]);
  }
  files.clear();
  await completeSampleGroup(pool, pool.ids.slice(0, 10));
  files.set(path, '{interrupted');
  expect(await loadSampleProgress(pool)).toEqual(pool.ids.slice(0, 10));
});

test('storage failures warn without blocking practice; unknown practice IDs are never persisted', async () => {
  jest.mocked(RNFS.writeFile).mockRejectedValueOnce(new Error('disk full'));
  let current = await session({ practiceWords: firstPool });
  await finish(current);
  expect(current.state.progressError).toBe(true);
  await act(async () => current.state.more());
  expect(ids(current.state.questions)).toEqual(ids(firstPool.slice(10, 20)));
  await current.close();
  jest.clearAllMocks();
  current = await session({
    practiceWords: [{ ...firstPool[0], id: '../private-data' }],
  });
  await finish(current);
  await current.close();
  expect(RNFS.exists).not.toHaveBeenCalled();
  expect(RNFS.writeFile).not.toHaveBeenCalled();
});

test('a delayed load cannot accept early answers, save a restart or update an unmounted quiz', async () => {
  let release!: (value: boolean) => void;
  jest.mocked(RNFS.exists).mockImplementationOnce(
    () =>
      new Promise<boolean>(resolve => {
        release = resolve;
      }),
  );
  const current = await session({ practiceWords: firstPool });
  expect(current.state.loadingProgress).toBe(true);
  await act(async () => {
    current.state.restart();
    current.state.selectOption(firstPool[0].id);
  });
  expect(current.state.score).toBe(0);
  await current.close();
  release(false);
  await loadSampleProgress(samplePool(firstPool, 'practice')!);
  expect(current.state.loadingProgress).toBe(true);
  expect(RNFS.writeFile).not.toHaveBeenCalled();
});
