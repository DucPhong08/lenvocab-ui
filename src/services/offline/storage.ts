import RNFS from 'react-native-fs';
import type { Flashcard, ReviewCard, User } from '@/api/contracts';

export type ReviewAttempt = {
  cardId: string;
  reviewId: string;
  quality: number;
  createdAt: string;
  term?: string;
  error?: string;
};
export type LearningSnapshot = {
  user: User;
  cards: Flashcard[];
  due: ReviewCard[];
  total: number;
  savedAt: string;
};
export type OfflineData = {
  version: 1;
  sessionKey: string;
  revision: number;
  snapshot: LearningSnapshot | null;
  queue: ReviewAttempt[];
};

export const MAX_PENDING_REVIEWS = 500;
const MAX_CACHED_CARDS = 2000;
const writes = new Map<string, Promise<unknown>>();
const closed = new Set<string>();
const keyPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function paths(key: string) {
  if (!keyPattern.test(key))
    throw new Error('Phiên lưu trên máy không hợp lệ.');
  const directory = `${RNFS.DocumentDirectoryPath}/lenvocab-offline`;
  return {
    directory,
    slots: [0, 1].map(slot => `${directory}/${key}.${slot}.json`),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function validCard(value: unknown) {
  return (
    isRecord(value) &&
    [
      'user_flashcard_id',
      'keyword',
      'meaning_vi',
      'example_1',
      'example_2',
      'next_review_date',
    ].every(field => typeof value[field] === 'string') &&
    Array.isArray(value.related_words) &&
    value.related_words.every(item => typeof item === 'string') &&
    ['interval', 'repetitions', 'efactor'].every(
      field =>
        typeof value[field] === 'number' && Number.isFinite(value[field]),
    )
  );
}
function valid(value: unknown, key: string): value is OfflineData {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    value.sessionKey !== key ||
    !Number.isSafeInteger(value.revision) ||
    (value.revision as number) < 0 ||
    !Array.isArray(value.queue) ||
    value.queue.length > MAX_PENDING_REVIEWS
  )
    return false;
  if (
    !value.queue.every(
      item =>
        isRecord(item) &&
        typeof item.cardId === 'string' &&
        typeof item.reviewId === 'string' &&
        typeof item.createdAt === 'string' &&
        Number.isInteger(item.quality) &&
        (item.quality as number) >= 0 &&
        (item.quality as number) <= 5 &&
        (item.error === undefined || typeof item.error === 'string') &&
        (item.term === undefined || typeof item.term === 'string'),
    )
  )
    return false;
  if (
    new Set(value.queue.map(item => item.reviewId)).size !== value.queue.length
  )
    return false;
  if (value.snapshot === null) return true;
  const snapshot = value.snapshot;
  return (
    isRecord(snapshot) &&
    isRecord(snapshot.user) &&
    typeof snapshot.user.id === 'string' &&
    isRecord(snapshot.user.preferences) &&
    typeof snapshot.savedAt === 'string' &&
    typeof snapshot.total === 'number' &&
    Number.isFinite(snapshot.total) &&
    snapshot.total >= 0 &&
    Array.isArray(snapshot.cards) &&
    snapshot.cards.length <= MAX_CACHED_CARDS &&
    snapshot.cards.every(validCard) &&
    Array.isArray(snapshot.due) &&
    snapshot.due.length <= MAX_CACHED_CARDS &&
    snapshot.due.every(validCard)
  );
}

function textOnly<T extends Flashcard | ReviewCard>(card: T): T {
  const fields = new Set([
    'user_flashcard_id',
    'global_flashcard_id',
    'keyword',
    'pronunciation',
    'meaning_vi',
    'example_1',
    'example_2',
    'related_words',
    'status',
    'interval',
    'repetitions',
    'efactor',
    'next_review_date',
    'image_style',
  ]);
  const text = Object.fromEntries(
    Object.entries(card).filter(([field]) => fields.has(field)),
  );
  return {
    ...text,
    audio_base64: null,
    image_url: null,
    has_image: false,
  } as T;
}
function sanitize(data: OfflineData): OfflineData {
  const snapshot = data.snapshot;
  const queue = data.queue.map(
    ({ cardId, reviewId, quality, createdAt, error, term }) => ({
      cardId,
      reviewId,
      quality,
      createdAt,
      error,
      term,
    }),
  );
  if (!snapshot) return { ...data, queue };
  const {
    id,
    username,
    display_name,
    account_tier,
    preferences,
    is_active,
    daily_quota_left,
    google_linked,
    scan_settings,
    preference_limits,
  } = snapshot.user;
  return {
    ...data,
    queue,
    snapshot: {
      ...snapshot,
      user: {
        id,
        username,
        display_name,
        account_tier,
        is_active,
        daily_quota_left,
        google_linked,
        scan_settings: scan_settings && {
          max_detected_objects: scan_settings.max_detected_objects,
          max_allowed_objects: scan_settings.max_allowed_objects,
          confidence_threshold: scan_settings.confidence_threshold,
        },
        preference_limits: preference_limits && {
          allowed_voices: preference_limits.allowed_voices,
          allowed_speeds: preference_limits.allowed_speeds,
          allow_neural_voice: preference_limits.allow_neural_voice,
          max_daily_review_goal: preference_limits.max_daily_review_goal,
          effective_daily_review_goal:
            preference_limits.effective_daily_review_goal,
        },
        email: null,
        preferences: {
          preferred_voice_id: preferences.preferred_voice_id,
          voice_speed: preferences.voice_speed,
          daily_review_goal: preferences.daily_review_goal,
          target_language: preferences.target_language,
          max_detected_objects: preferences.max_detected_objects,
        },
      },
      cards: snapshot.cards.slice(0, MAX_CACHED_CARDS).map(textOnly),
      due: snapshot.due.slice(0, MAX_CACHED_CARDS).map(textOnly),
    },
  };
}

async function read(key: string): Promise<OfflineData | null> {
  const { slots } = paths(key);
  if (closed.has(key)) return null;
  const records = await Promise.all(
    slots.map(async path => {
      if (!(await RNFS.exists(path))) return null;
      try {
        const text = await RNFS.readFile(path, 'utf8');
        if (text.length > 8_000_000) return null;
        const data: unknown = JSON.parse(text);
        return valid(data, key) ? data : null;
      } catch {
        return null;
      }
    }),
  );
  return (
    records
      .filter((item): item is OfflineData => item !== null)
      .sort((a, b) => b.revision - a.revision)[0] ?? null
  );
}

export async function loadLearning(key: string) {
  await writes.get(key)?.catch(() => {});
  return read(key);
}

export function updateLearning(
  key: string,
  change: (data: OfflineData) => OfflineData,
): Promise<OfflineData> {
  const job = (writes.get(key) ?? Promise.resolve())
    .catch(() => {})
    .then(async () => {
      const { directory, slots } = paths(key);
      if (closed.has(key)) throw new Error('Phiên lưu trên máy đã đóng.');
      const previous: OfflineData = (await read(key)) ?? {
        version: 1,
        sessionKey: key,
        revision: 0,
        snapshot: null,
        queue: [],
      };
      const next = sanitize({
        ...change(previous),
        version: 1,
        sessionKey: key,
        revision: previous.revision + 1,
      });
      if (!valid(next, key))
        throw new Error('Không thể lưu dữ liệu học không hợp lệ.');
      await RNFS.mkdir(directory, { NSURLIsExcludedFromBackupKey: true });
      if (closed.has(key)) throw new Error('Phiên lưu trên máy đã đóng.');
      // Alternate complete records so an interrupted write keeps the previous slot readable.
      await RNFS.writeFile(
        slots[next.revision % 2],
        JSON.stringify(next),
        'utf8',
      );
      return next;
    });
  writes.set(key, job);
  return job;
}

export function clearLearning(key: string) {
  closed.add(key);
  const job = (writes.get(key) ?? Promise.resolve())
    .catch(() => {})
    .then(async () => {
      for (const path of paths(key).slots)
        if (await RNFS.exists(path)) await RNFS.unlink(path);
    });
  writes.set(key, job);
  return job;
}
