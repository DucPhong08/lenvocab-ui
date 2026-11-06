import type { Flashcard, ScanResult } from '@/api/contracts';

export function isWordSaved(
  id: string,
  {
    saved,
    cards,
    scanResult,
  }: {
    saved: string[];
    cards: Flashcard[];
    scanResult: ScanResult | null;
  },
) {
  return (
    saved.includes(id) ||
    !!(
      scanResult &&
      id.startsWith('scan:') &&
      cards.some(
        card =>
          card.keyword.toLowerCase() === scanResult.keyword?.toLowerCase(),
      )
    )
  );
}
