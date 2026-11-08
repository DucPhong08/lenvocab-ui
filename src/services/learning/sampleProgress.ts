import RNFS from 'react-native-fs';
import { allWords, type Word } from '@/data/scenes';

export type SamplePool = { key: string; ids: string[] };
type Progress = {
  version: 1;
  revision: number;
  ids: string[];
  completed: string[];
};
const knownIds = new Set(allWords.map(word => word.id));
const writes = new Map<string, Promise<unknown>>();
const MAX_POOL_WORDS = 2000;
const MAX_FILE_SIZE = 256_000;

export function samplePool(
  words: Word[],
  source: 'practice' | 'guest',
): SamplePool | null {
  const ids = [...new Set(words.map(word => word.id))];
  if (
    !ids.length ||
    ids.length > MAX_POOL_WORDS ||
    ids.some(id => !knownIds.has(id))
  )
    return null;
  // Ordered IDs distinguish topic-first pools and level filters without storing user data.
  const text = ids.join('|');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++)
    hash = (hash * 31 + text.charCodeAt(index)) % 4_294_967_291;
  return { key: `${source}-${hash.toString(16)}`, ids };
}

function paths(pool: SamplePool) {
  if (!/^(practice|guest)-[0-9a-f]{1,8}$/.test(pool.key))
    throw new Error('Invalid sample pool');
  const directory = `${RNFS.DocumentDirectoryPath}/lenvocab-sample-progress`;
  return {
    directory,
    slots: [0, 1].map(slot => `${directory}/${pool.key}.${slot}.json`),
  };
}

function valid(data: unknown, pool: SamplePool): data is Progress {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const item = data as Record<string, unknown>;
  return (
    item.version === 1 &&
    Number.isSafeInteger(item.revision) &&
    (item.revision as number) >= 0 &&
    Array.isArray(item.ids) &&
    item.ids.length === pool.ids.length &&
    item.ids.every((id, index) => id === pool.ids[index]) &&
    Array.isArray(item.completed) &&
    item.completed.length <= pool.ids.length &&
    new Set(item.completed).size === item.completed.length &&
    item.completed.every(id => typeof id === 'string' && pool.ids.includes(id))
  );
}

async function read(pool: SamplePool): Promise<Progress> {
  const records = await Promise.all(
    paths(pool).slots.map(async path => {
      if (!(await RNFS.exists(path))) return null;
      const text = await RNFS.readFile(path, 'utf8');
      if (text.length > MAX_FILE_SIZE) return null;
      try {
        const data: unknown = JSON.parse(text);
        return valid(data, pool) ? data : null;
      } catch {
        return null;
      }
    }),
  );
  return (
    records
      .filter((item): item is Progress => item !== null)
      .sort((a, b) => b.revision - a.revision)[0] ?? {
      version: 1,
      revision: 0,
      ids: pool.ids,
      completed: [],
    }
  );
}

function queue<T>(pool: SamplePool, action: () => Promise<T>): Promise<T> {
  const job = (writes.get(pool.key) ?? Promise.resolve())
    .catch(() => {})
    .then(action);
  writes.set(pool.key, job);
  const cleanup = () => {
    if (writes.get(pool.key) === job) writes.delete(pool.key);
  };
  job.then(cleanup, cleanup);
  return job;
}

export function loadSampleProgress(pool: SamplePool) {
  return queue(pool, async () => (await read(pool)).completed);
}

function save(pool: SamplePool, completed: string[] | null) {
  return queue(pool, async () => {
    const previous = await read(pool);
    const next: Progress = {
      version: 1,
      revision: previous.revision + 1,
      ids: pool.ids,
      completed: completed
        ? [...new Set([...previous.completed, ...completed])]
        : [],
    };
    if (!valid(next, pool)) throw new Error('Invalid sample progress');
    const { directory, slots } = paths(pool);
    await RNFS.mkdir(directory, { NSURLIsExcludedFromBackupKey: true });
    // Keep the previous complete record if the next write is interrupted.
    const text = JSON.stringify(next);
    if (text.length > MAX_FILE_SIZE)
      throw new Error('Sample progress is too large');
    await RNFS.writeFile(slots[next.revision % 2], text, 'utf8');
  });
}

export const completeSampleGroup = (pool: SamplePool, ids: string[]) =>
  save(pool, ids);
export const resetSampleProgress = (pool: SamplePool) => save(pool, null);
