import type { Asset } from 'react-native-image-picker';
import type { Flashcard, ReviewCard, ScanResult, User } from '@/api/contracts';
import type { Word } from '@/data/scenes';

export type Screen =
  | 'home'
  | 'camera'
  | 'results'
  | 'word'
  | 'saved'
  | 'review'
  | 'flashcards'
  | 'quiz'
  | 'history'
  | 'profile'
  | 'onboarding'
  | 'auth';

export type ScanEntry = {
  id: number;
  sceneId: string;
  imageUri?: string;
  timestamp: number;
  result?: ScanResult;
};

export type ScreenProps = {
  navigate: (next: Screen) => void;
  sceneId: string;
  setSceneId: (id: string) => void;
  imageUri: string | null;
  setImageUri: (uri: string | null) => void;
  scan: () => void;
  wordId: string;
  wordBack: Screen;
  openWord: (id: string) => void;
  saved: string[];
  toggleSaved: (id: string) => void;
  history: ScanEntry[];
  openHistory: (entry: ScanEntry) => void;
  scrollToEnd: () => void;
  scrollToTop: () => void;
  asset: Asset | null;
  selectImage: (asset: Asset | null) => void;
  scanResult: ScanResult | null;
  scanning: boolean;
  saving: boolean;
  user: User | null;
  cards: Flashcard[];
  due: ReviewCard[];
  loadingData: boolean;
  wordForId: (id: string) => Word;
  submitReview: (id: string, quality: number) => Promise<void>;
  onAuth: (
    mode: 'login' | 'register',
    email: string,
    password: string,
    name: string,
  ) => Promise<void>;
  onLogout: () => Promise<void>;
  authBusy: boolean;
};
