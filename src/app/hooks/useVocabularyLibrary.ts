import { useState } from 'react';
import { Alert } from 'react-native';
import type { Flashcard, ScanResult } from '@/api/contracts';
import { confirmFlashcard } from '@/api/endpoints/confirmFlashcard';
import { cardWord } from '@/api/mappers/cardWord';
import { scanWord } from '@/api/mappers/scanWord';
import { getWord } from '@/data/getWord';
import type { Word } from '@/data/scenes';
import type { Screen } from '@/types/screen';

type UseVocabularyLibraryOptions = {
  cards: Flashcard[];
  navigate: (screen: Screen) => void;
  reloadCards: () => Promise<unknown>;
  reloadDue: () => Promise<unknown>;
  scanResult: ScanResult | null;
  showFeedback: (message: string) => void;
  token: string | null;
};

export function useVocabularyLibrary({
  cards,
  navigate,
  reloadCards,
  reloadDue,
  scanResult,
  showFeedback,
  token,
}: UseVocabularyLibraryOptions) {
  const [saving, setSaving] = useState(false);
  const saved = cards.map(card => card.user_flashcard_id);

  const wordForId = (id: string): Word => {
    if (id.startsWith('scan:') && scanResult) return scanWord(scanResult);
    const card = cards.find(item => item.user_flashcard_id === id);
    return card ? cardWord(card) : getWord(id);
  };

  const toggleSaved = async (id: string) => {
    if (!token) {
      showFeedback('Đăng nhập để lưu từ và đồng bộ kho học.');
      navigate('auth');
      return;
    }

    const scannedWord = scanResult ? scanWord(scanResult) : null;
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
    if (saving) return;

    setSaving(true);
    try {
      await confirmFlashcard(token, scanResult);
      await Promise.all([reloadCards(), reloadDue()]);
      showFeedback('Đã lưu từ vào tài khoản của bạn.');
    } catch (error) {
      Alert.alert(
        'Không thể lưu từ',
        error instanceof Error ? error.message : 'Thử lại sau.',
      );
    } finally {
      setSaving(false);
    }
  };

  return { saved, saving, toggleSaved, wordForId };
}
