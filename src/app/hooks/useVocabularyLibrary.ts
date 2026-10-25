import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { ApiError } from '@/api/client/ApiError';
import type { Flashcard, ReviewCard, ScanResult } from '@/api/contracts';
import { confirmFlashcard } from '@/api/endpoints/confirmFlashcard';
import { uploadCardImage } from '@/api/endpoints/cardImage';
import { cardWord } from '@/api/mappers/cardWord';
import { scanWord } from '@/api/mappers/scanWord';
import { getWord } from '@/data/getWord';
import type { Word } from '@/data/scenes';

type UseVocabularyLibraryOptions = {
  cards: Flashcard[];
  due?: ReviewCard[];
  requestSignIn: (wordId: string | null) => void;
  onUnauthorized: () => Promise<unknown>;
  applyCard: (card: Flashcard) => Promise<unknown>;
  reloadCards: () => Promise<unknown>;
  reloadDue: () => Promise<unknown>;
  scanResult: ScanResult | null;
  imageUri?: string | null;
  showFeedback: (message: string) => void;
  token: string | null;
};

export function useVocabularyLibrary({
  cards,
  due = [],
  requestSignIn,
  onUnauthorized,
  applyCard,
  reloadCards,
  reloadDue,
  scanResult,
  imageUri,
  showFeedback,
  token,
}: UseVocabularyLibraryOptions) {
  const [saving, setSaving] = useState(false);
  const [selections, setSelections] = useState<
    Array<{
      token: string;
      key: string;
      card: Flashcard;
      imageSaved: boolean;
    }>
  >([]);
  useEffect(() => {
    setSelections([]);
  }, [token]);
  const legacyKeys = useRef(new WeakMap<ScanResult, number>());
  const nextKey = useRef(0);
  const selectionKey = useCallback(
    (result: ScanResult, uri?: string | null) => {
      if (!result.selected_object_id && !legacyKeys.current.has(result))
        legacyKeys.current.set(result, ++nextKey.current);
      return JSON.stringify([
        uri ?? null,
        result.selected_object_id ?? `legacy:${legacyKeys.current.get(result)}`,
      ]);
    },
    [],
  );
  const ownedSelections = useMemo(
    () => selections.filter(item => item.token === token),
    [selections, token],
  );
  const currentKey = scanResult ? selectionKey(scanResult, imageUri) : null;
  const confirmed = ownedSelections.find(item => item.key === currentKey);
  const confirmedCard = confirmed
    ? cards.find(
        card => card.user_flashcard_id === confirmed.card.user_flashcard_id,
      ) ?? confirmed.card
    : null;
  const savingRequest = useRef(false);
  const currentToken = useRef(token);
  currentToken.current = token;
  const saved = [
    ...new Set(
      [...ownedSelections.map(item => item.card), ...cards, ...due].map(
        card => card.user_flashcard_id,
      ),
    ),
  ];

  const wordForId = (id: string): Word => {
    if (id.startsWith('scan:') && scanResult) {
      if (confirmedCard) return cardWord(confirmedCard);
      return { ...scanWord(scanResult), imageUrl: imageUri ?? null };
    }
    const locallySaved = ownedSelections.find(
      item => item.card.user_flashcard_id === id,
    )?.card;
    if (locallySaved)
      return cardWord(
        cards.find(item => item.user_flashcard_id === id) ?? locallySaved,
      );
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
      const alreadyStored = [
        ...cards,
        ...ownedSelections.map(item => item.card),
      ].some(
        card =>
          card.user_flashcard_id === id ||
          (scannedWord?.id === id &&
            card.keyword.toLowerCase() === scanResult?.keyword?.toLowerCase()),
      );
      if (!scanResult || scannedWord?.id !== id) {
        showFeedback('Hãy quét ảnh thật để tạo thẻ trước khi lưu.');
        return;
      }
      if (savingRequest.current) return;

      savingRequest.current = true;
      setSaving(true);
      const requestToken = token;
      const key = selectionKey(scanResult, imageUri);
      try {
        let stored = await confirmFlashcard(token, scanResult);
        if (currentToken.current !== requestToken) return;
        let imageError: string | null = null;
        if (imageUri) {
          try {
            const photo = await uploadCardImage(
              token,
              stored.user_flashcard_id,
              { uri: imageUri },
              scanResult.status === 'OK' ? scanResult.bounding_box : null,
            );
            stored = { ...stored, ...photo };
          } catch (error) {
            if (currentToken.current !== requestToken) return;
            if (error instanceof ApiError && error.status === 401) {
              await onUnauthorized();
              return;
            }
            imageError =
              error instanceof Error ? error.message : 'Vui lòng thử lại.';
          }
        }
        if (currentToken.current !== requestToken) return;
        setSelections(current => [
          { token: requestToken, key, card: stored, imageSaved: !imageError },
          ...current.filter(
            item =>
              item.token === requestToken &&
              item.key !== key &&
              (Boolean(imageError) ||
                item.card.user_flashcard_id !== stored.user_flashcard_id),
          ),
        ]);
        await applyCard(stored).catch(() => {});
        if (currentToken.current !== requestToken) return;
        if (imageError) {
          Alert.alert(
            'Đã lưu từ nhưng ảnh chưa được lưu',
            `${imageError} Mở thẻ trong kho từ để thêm lại ảnh.`,
          );
        }
        showFeedback(
          imageError
            ? 'Đã lưu từ. Ảnh chưa được lưu.'
            : alreadyStored
            ? 'Đã cập nhật ảnh cho thẻ đã lưu.'
            : 'Đã lưu từ vào tài khoản của bạn.',
        );
        // Storage is complete: refreshing remote lists must not hold the save button.
        Promise.allSettled([reloadCards(), reloadDue()]).then(results => {
          if (
            currentToken.current === requestToken &&
            results.some(result => result.status === 'rejected') &&
            !imageError
          )
            showFeedback(
              'Đã lưu từ. Chưa thể cập nhật kho học; vui lòng tải lại.',
            );
        });
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
      ownedSelections,
      selectionKey,
      onUnauthorized,
      applyCard,
      reloadCards,
      reloadDue,
      requestSignIn,
      scanResult,
      imageUri,
      showFeedback,
      token,
    ],
  );

  const currentScanSaved = Boolean(
    confirmed && (!imageUri || confirmed.imageSaved),
  );
  return { saved, saving, toggleSaved, wordForId, currentScanSaved };
}
