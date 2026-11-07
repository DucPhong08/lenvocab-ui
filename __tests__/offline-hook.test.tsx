import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { useOfflineLearning } from '@/app/hooks/useOfflineLearning';
import {
  loadLearning,
  updateLearning,
  type OfflineData,
} from '@/services/offline/storage';
import { syncLearning } from '@/services/offline/sync';

jest.mock('@/services/offline/storage', () => ({
  loadLearning: jest.fn(),
  updateLearning: jest.fn(),
  MAX_PENDING_REVIEWS: 500,
}));
jest.mock('@/services/offline/sync', () => ({
  syncLearning: jest.fn().mockResolvedValue(undefined),
}));
const key = '55555555-5555-4555-8555-555555555555';
const empty = (): OfflineData => ({
  version: 1,
  sessionKey: key,
  revision: 0,
  snapshot: null,
  queue: [],
});
let disk: OfflineData;
let hook: ReturnType<typeof useOfflineLearning>;
let renderer: ReactTestRenderer.ReactTestRenderer;
const onReview = jest.fn().mockResolvedValue(undefined);
const onUnauthorized = jest.fn().mockResolvedValue(undefined);
function Harness({ sessionKey = key }: { sessionKey?: string }) {
  hook = useOfflineLearning({
    sessionKey,
    token: sessionKey,
    onReview,
    onUnauthorized,
  });
  return null;
}
beforeEach(() => {
  disk = empty();
  jest.clearAllMocks();
  jest.mocked(loadLearning).mockResolvedValue(disk);
  jest.mocked(updateLearning).mockImplementation(async (_key, change) => {
    disk = { ...change(disk), revision: disk.revision + 1 };
    return disk;
  });
});
afterEach(async () => {
  await act(async () => renderer?.unmount());
});

test('a slow initial load cannot erase a more recent durable review', async () => {
  let resolve!: (value: OfflineData | null) => void;
  jest.mocked(loadLearning).mockReturnValueOnce(
    new Promise(done => {
      resolve = done;
    }),
  );
  await act(async () => {
    renderer = ReactTestRenderer.create(<Harness />);
  });
  await act(async () => {
    await hook.enqueue('card-1', 5, 'r1');
  });
  expect(hook.queue).toHaveLength(1);
  await act(async () => {
    resolve(empty());
  });
  expect(hook.queue.map(item => item.reviewId)).toEqual(['r1']);
});

test('disk failure rejects the grade and never starts sending it', async () => {
  await act(async () => {
    renderer = ReactTestRenderer.create(<Harness />);
  });
  jest.mocked(updateLearning).mockRejectedValueOnce(new Error('disk full'));
  await act(async () => {
    await expect(hook.enqueue('card-1', 5, 'r1')).rejects.toThrow('disk full');
  });
  expect(hook.queue).toEqual([]);
  expect(syncLearning).not.toHaveBeenCalled();
});

test('retries preserve one payload and a second score for the same pending card is rejected', async () => {
  await act(async () => {
    renderer = ReactTestRenderer.create(<Harness />);
  });
  await act(async () => {
    await hook.enqueue('card-1', 5, 'r1');
    await hook.enqueue('card-1', 5, 'r1');
  });
  expect(hook.queue).toHaveLength(1);
  await act(async () => {
    await expect(hook.enqueue('card-1', 3, 'r1')).rejects.toThrow();
  });
  await act(async () => {
    await expect(hook.enqueue('card-1', 5, 'r2')).rejects.toThrow();
  });
  expect(hook.queue[0]).toEqual(
    expect.objectContaining({ quality: 5, reviewId: 'r1' }),
  );
});

test('a callback captured by the old account cannot write after switching sessions', async () => {
  await act(async () => {
    renderer = ReactTestRenderer.create(<Harness />);
  });
  const oldEnqueue = hook.enqueue;
  await act(async () => {
    renderer.update(
      <Harness sessionKey="66666666-6666-4666-8666-666666666666" />,
    );
  });
  await act(async () => {
    await expect(oldEnqueue('card-1', 5, 'r1')).rejects.toThrow();
  });
  expect(updateLearning).not.toHaveBeenCalled();
});
