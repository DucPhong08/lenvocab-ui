import { ApiError } from '@/api/client/ApiError';
import { gradeReview } from '@/api/endpoints/gradeReview';
import { loadLearning, updateLearning } from '@/services/offline/storage';
import { syncLearning } from '@/services/offline/sync';
import type { SubmitReviewResponse } from '@/api/contracts';

jest.mock('react-native-fs');
jest.mock('@/api/endpoints/gradeReview', () => ({ gradeReview: jest.fn() }));
const mockFiles: Map<string, string> =
  jest.requireMock('react-native-fs').__files;
const key = '44444444-4444-4444-8444-444444444444';
const result: SubmitReviewResponse = {
  user_flashcard_id: 'card-1',
  interval_after: 1,
  repetitions_after: 1,
  efactor_after: 2.5,
  next_review_date: '2026-11-08',
  message: 'saved',
};
const item = (reviewId: string, cardId = 'card-1') => ({
  reviewId,
  cardId,
  quality: 5,
  createdAt: '2026-11-07T00:00:00Z',
});
const options = () => ({
  sessionKey: key,
  token: 'test-token-not-stored',
  isCurrent: () => true,
  onReview: jest.fn().mockResolvedValue(undefined),
  onChange: jest.fn(),
  onUnauthorized: jest.fn().mockResolvedValue(undefined),
});
beforeEach(() => {
  mockFiles.clear();
  jest.clearAllMocks();
  jest.mocked(gradeReview).mockResolvedValue(result);
});

test('network retries reuse the persisted review_id and only remove it after acknowledgment', async () => {
  await updateLearning(key, data => ({ ...data, queue: [item('r1')] }));
  jest.mocked(gradeReview).mockRejectedValueOnce(new ApiError('offline', 0));
  const callbacks = options();
  await expect(syncLearning(callbacks)).rejects.toThrow('offline');
  expect((await loadLearning(key))?.queue).toHaveLength(1);
  await syncLearning(callbacks);
  expect(jest.mocked(gradeReview).mock.calls).toEqual([
    ['test-token-not-stored', 'card-1', 5, 'r1'],
    ['test-token-not-stored', 'card-1', 5, 'r1'],
  ]);
  expect((await loadLearning(key))?.queue).toEqual([]);
  expect(callbacks.onReview).toHaveBeenCalledTimes(1);
  expect([...mockFiles.values()].join('')).not.toContain(
    'test-token-not-stored',
  );
});

test('concurrent sync requests share one send', async () => {
  await updateLearning(key, data => ({ ...data, queue: [item('r1')] }));
  const callbacks = options();
  await Promise.all([syncLearning(callbacks), syncLearning(callbacks)]);
  expect(gradeReview).toHaveBeenCalledTimes(1);
});

test('server-rejected items stay visible while other queued items can sync', async () => {
  await updateLearning(key, data => ({
    ...data,
    queue: [item('r1'), item('r2', 'card-2')],
  }));
  jest
    .mocked(gradeReview)
    .mockRejectedValueOnce(new ApiError('not found', 404));
  await syncLearning(options());
  expect(gradeReview).toHaveBeenCalledTimes(2);
  expect((await loadLearning(key))?.queue).toEqual([
    expect.objectContaining({ reviewId: 'r1', error: 'not found' }),
  ]);
});

test('rate limiting retains an item for later automatic retry', async () => {
  await updateLearning(key, data => ({ ...data, queue: [item('r1')] }));
  jest.mocked(gradeReview).mockRejectedValueOnce(new ApiError('wait', 429));
  await expect(syncLearning(options())).rejects.toThrow('wait');
  expect((await loadLearning(key))?.queue[0].error).toBeUndefined();
});

test('switching sessions while the server responds does not update or acknowledge the old queue', async () => {
  await updateLearning(key, data => ({ ...data, queue: [item('r1')] }));
  let resolve!: (value: SubmitReviewResponse) => void;
  jest.mocked(gradeReview).mockImplementationOnce(
    () =>
      new Promise(done => {
        resolve = done;
      }),
  );
  let current = true;
  const callbacks = { ...options(), isCurrent: () => current };
  const pending = syncLearning(callbacks);
  while (!resolve) await Promise.resolve();
  current = false;
  resolve(result);
  await pending;
  expect(callbacks.onReview).not.toHaveBeenCalled();
  expect((await loadLearning(key))?.queue).toHaveLength(1);
});

test('expired authorization asks the caller to clear its secure session', async () => {
  await updateLearning(key, data => ({ ...data, queue: [item('r1')] }));
  jest.mocked(gradeReview).mockRejectedValueOnce(new ApiError('expired', 401));
  const callbacks = options();
  await syncLearning(callbacks);
  expect(callbacks.onUnauthorized).toHaveBeenCalledTimes(1);
  expect(callbacks.onReview).not.toHaveBeenCalled();
});
