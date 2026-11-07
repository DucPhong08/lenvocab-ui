export type Word = {
  id: string;
  term: string;
  ipa: string;
  type: string;
  meaning: string;
  example: string;
  example2?: string;
  translation?: string;
  note: string;
  level: string;
  scene: string;
  audio?: string | null;
  imageUrl?: string | null;
  imageStyle?: 'photo' | 'sticker';
  hasImage?: boolean;
  userFlashcardId?: string;
  interval?: number;
  repetitions?: number;
  nextReviewDate?: string;
};

export type Scene = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  category: string;
  words: Word[];
};
