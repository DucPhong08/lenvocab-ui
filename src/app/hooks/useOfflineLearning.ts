import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { SubmitReviewResponse } from '@/api/contracts';
import { errorMessage } from '@/utils/errorMessage';
import {
  loadLearning,
  updateLearning,
  MAX_PENDING_REVIEWS,
  type LearningSnapshot,
  type OfflineData,
} from '@/services/offline/storage';
import { syncLearning } from '@/services/offline/sync';

export function useOfflineLearning({
  sessionKey,
  token,
  onReview,
  onUnauthorized,
}: {
  sessionKey: string | null;
  token: string | null;
  onReview: (result: SubmitReviewResponse) => Promise<void>;
  onUnauthorized: () => Promise<unknown>;
}) {
  const latest = useRef({ sessionKey, token, onReview, onUnauthorized });
  latest.current = { sessionKey, token, onReview, onUnauthorized };
  const [stored, setStored] = useState<{
    key: string | null;
    data: OfflineData | null;
  }>({ key: null, data: null });
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const mounted = useRef(true);
  const data = stored.key === sessionKey ? stored.data : null;

  const accept = useCallback(
    (value: OfflineData | null) => {
      if (
        !mounted.current ||
        latest.current.sessionKey !== sessionKey ||
        latest.current.token !== token
      )
        return;
      setStored(current =>
        current.key === sessionKey &&
        (current.data?.revision ?? -1) > (value?.revision ?? -1)
          ? current
          : { key: sessionKey, data: value },
      );
    },
    [sessionKey, token],
  );

  useEffect(() => {
    let active = true;
    mounted.current = true;
    setStored({ key: sessionKey, data: null });
    setSyncError(null);
    setSyncing(false);
    setStorageError(null);
    if (!sessionKey || !token) {
      setLoadedKey(null);
      return;
    }
    loadLearning(sessionKey)
      .then(value => {
        if (active) accept(value);
      })
      .catch(() => {
        if (active)
          setStorageError(
            'Chưa đọc được bản lưu trên máy. Kết nối mạng để tải lại.',
          );
      })
      .finally(() => {
        if (active) setLoadedKey(sessionKey);
      });
    return () => {
      active = false;
      mounted.current = false;
    };
  }, [sessionKey, token, accept]);

  const persist = useCallback(
    async (change: (data: OfflineData) => OfflineData) => {
      if (
        !sessionKey ||
        !token ||
        !mounted.current ||
        latest.current.sessionKey !== sessionKey ||
        latest.current.token !== token
      )
        throw new Error('Cần đăng nhập lại để lưu lượt ôn.');
      const result = await updateLearning(sessionKey, change);
      accept(result);
      if (
        mounted.current &&
        latest.current.sessionKey === sessionKey &&
        latest.current.token === token
      )
        setStorageError(null);
      return result;
    },
    [sessionKey, token, accept],
  );

  const flush = useCallback(async () => {
    if (!sessionKey || !token) return;
    const isCurrent = () =>
      mounted.current &&
      latest.current.sessionKey === sessionKey &&
      latest.current.token === token;
    setSyncing(true);
    setSyncError(null);
    try {
      await syncLearning({
        sessionKey,
        token,
        isCurrent,
        onReview: result => latest.current.onReview(result),
        onUnauthorized: () => latest.current.onUnauthorized(),
        onChange: value => {
          if (isCurrent()) accept(value);
        },
      });
    } catch (cause) {
      if (isCurrent())
        setSyncError(
          errorMessage(
            cause,
            'Lượt ôn vẫn được giữ trên máy. Thử đồng bộ lại khi có mạng.',
          ),
        );
    } finally {
      if (isCurrent()) setSyncing(false);
    }
  }, [sessionKey, token, accept]);

  const enqueue = useCallback(
    async (cardId: string, quality: number, reviewId: string) => {
      if (!Number.isInteger(quality) || quality < 0 || quality > 5)
        throw new Error('Mức nhớ không hợp lệ.');
      await persist(current => {
        const existing = current.queue.find(
          item => item.reviewId === reviewId || item.cardId === cardId,
        );
        if (existing) {
          if (
            existing.reviewId !== reviewId ||
            existing.cardId !== cardId ||
            existing.quality !== quality
          )
            throw new Error('Từ này đã có điểm ôn đang chờ đồng bộ.');
          return current;
        }
        if (current.queue.length >= MAX_PENDING_REVIEWS)
          throw new Error(
            'Bản lưu lượt ôn đã đầy. Đồng bộ trước khi học tiếp.',
          );
        const term = [
          ...(current.snapshot?.cards ?? []),
          ...(current.snapshot?.due ?? []),
        ].find(card => card.user_flashcard_id === cardId)?.keyword;
        return {
          ...current,
          queue: [
            ...current.queue,
            {
              cardId,
              quality,
              reviewId,
              term,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      });
      flush();
    },
    [persist, flush],
  );

  const saveSnapshot = useCallback(
    async (snapshot: LearningSnapshot) => {
      try {
        await persist(current => ({ ...current, snapshot }));
      } catch {
        if (mounted.current && latest.current.sessionKey === sessionKey)
          setStorageError(
            'Chưa lưu được kho từ trên máy. Các thẻ mới cần mạng để mở lại.',
          );
      }
    },
    [persist, sessionKey],
  );

  const retry = useCallback(async () => {
    if (!sessionKey || !token) return;
    await persist(current => ({
      ...current,
      queue: current.queue.map(item => ({ ...item, error: undefined })),
    }));
    await flush();
  }, [sessionKey, token, persist, flush]);
  const discard = useCallback(
    async (reviewId: string) => {
      await persist(current => ({
        ...current,
        queue: current.queue.filter(item => item.reviewId !== reviewId),
      }));
    },
    [persist],
  );

  const pendingCount = data?.queue.filter(item => !item.error).length ?? 0;
  useEffect(() => {
    if (!pendingCount) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const resume = (state: string) => {
      clearInterval(timer);
      if (state !== 'active') return;
      flush();
      timer = setInterval(() => {
        flush();
      }, 30_000);
    };
    resume(AppState.currentState ?? 'active');
    const listener = AppState.addEventListener('change', resume);
    return () => {
      clearInterval(timer);
      listener.remove();
    };
  }, [pendingCount, flush]);

  return {
    snapshot: data?.snapshot ?? null,
    queue: data?.queue ?? [],
    ready: !sessionKey || loadedKey === sessionKey,
    syncing,
    syncError,
    storageError,
    enqueue,
    saveSnapshot,
    retry,
    discard,
  };
}
