import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { ApiError } from '@/api/client/ApiError';
import type { Flashcard, ReviewCard, ScanResult } from '@/api/contracts';
import { confirmFlashcard } from '@/api/endpoints/confirmFlashcard';
import { cardWord } from '@/api/mappers/cardWord';
import { scanWord } from '@/api/mappers/scanWord';
import { getWord } from '@/data/getWord';
import type { Word } from '@/data/scenes';

type UseVocabularyLibraryOptions = {
  cards: Flashcard[];
  due?: ReviewCard[];
  requestSignIn: (wordId: string | null) => void;
  onUnauthorized: () => Promise<unknown>;
  reloadCards: () => Promise<unknown>;
  reloadDue: () => Promise<unknown>;
  scanResult: ScanResult | null;
  showFeedback: (message: string) => void;
  token: string | null;
};

export function useVocabularyLibrary({
  cards,
  due = [],
  requestSignIn,
  onUnauthorized,
  reloadCards,
  reloadDue,
  scanResult,
  showFeedback,
  token,
}: UseVocabularyLibraryOptions) {
  const [saving, setSaving] = useState(false);
  const savingRequest = useRef(false);
  const currentToken = useRef(token);
  currentToken.current = token;
  const saved = [
    ...new Set([...cards, ...due].map(card => card.user_flashcard_id)),
  ];

  const wordForId = (id: string): Word => {
    if (id.startsWith('scan:') && scanResult) return scanWord(scanResult);
    const card =
      cards.find(item => item.user_flashcard_id === id) ??
      due.find(item => item.user_flashcard_id === id);
    return card ? cardWord(card) : getWord(id);
  };

  const toggleSaved = useCallback(
    async (id: string) => {
      const scannedWord = scanResult ? scanWord(scanResult) : null;
      if (!token) {
        showFeedback('Đăng nhập để lưu từ và đồng bộ kho học.');
        requestSignIn(scannedWord?.id === id ? id : null);
        return;
      }
      const alreadyStored = cards.some(
        card =>
          card.user_flashcard_id === id ||
          (scannedWord?.id === id &&
            card.keyword.toLowerCase() === scanResult?.keyword?.toLowerCase()),
      );
      if (alreadyStored) {
        showFeedback('Từ này đã có trong kho của bạn.');
        return;
      }
      if (!scanResult || scannedWord?.id !== id) {
        showFeedback('Hãy quét ảnh thật để tạo thẻ trước khi lưu.');
        return;
      }
      if (savingRequest.current) return;

      savingRequest.current = true;
      setSaving(true);
      const requestToken = token;
      try {
        await confirmFlashcard(token, scanResult);
        if (currentToken.current !== requestToken) return;
        const refresh = await Promise.allSettled([reloadCards(), reloadDue()]);
        if (currentToken.current !== requestToken) return;
        showFeedback(
          refresh.some(result => result.status === 'rejected')
            ? 'Đã lưu từ. Chưa thể cập nhật kho học; vui lòng tải lại.'
            : 'Đã lưu từ vào tài khoản của bạn.',
        );
      } catch (error) {
        if (currentToken.current !== requestToken) return;
        if (error instanceof ApiError && error.status === 401) {
          await onUnauthorized();
          return;
        }
        Alert.alert(
          'Không thể lưu từ',
          error instanceof Error ? error.message : 'Thử lại sau.',
        );
      } finally {
        savingRequest.current = false;
        setSaving(false);
      }
    },
    [
      cards,
      onUnauthorized,
      reloadCards,
      reloadDue,
      requestSignIn,
      scanResult,
      showFeedback,
      token,
    ],
  );

  return { saved, saving, toggleSaved, wordForId };
}
