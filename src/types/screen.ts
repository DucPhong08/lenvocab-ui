import type { Asset } from 'react-native-image-picker';
import type {
  DetectedObject,
  Flashcard,
  ReviewCard,
  ScanResult,
  User,
} from '@/api/contracts';
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
  token: string | null;
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
  totalSaved: number;
  hasMoreCards: boolean;
  loadingMoreCards: boolean;
  loadMoreCards: () => Promise<void>;
  onVoiceSpeedChange: (speed: number) => Promise<void>;
  preferencesBusy: boolean;
  toggleSaved: (id: string) => void;
  history: ScanEntry[];
  openHistory: (entry: ScanEntry) => void;
  scrollToEnd: () => void;
  scrollToTop: () => void;
  asset: Asset | null;
  selectImage: (asset: Asset | null) => void;
  scanResult: ScanResult | null;
  scanning: boolean;
  selectObject?: (item: DetectedObject) => void;
  selectingObject?: boolean;
  currentScanSaved?: boolean;
  saving: boolean;
  user: User | null;
  cards: Flashcard[];
  due: ReviewCard[];
  loadingData: boolean;
  dataError: string | null;
  reloadData: () => Promise<void>;
  wordForId: (id: string) => Word;
  submitReview: (
    id: string,
    quality: number,
    reviewId: string,
  ) => Promise<void>;
  onAuth: (
    mode: 'login' | 'register',
    username: string,
    password: string,
    name: string,
    email?: string,
  ) => Promise<void>;
  onGoogleAuth: () => Promise<void>;
  onGoogleLink: () => Promise<void>;
  googleLinkBusy: boolean;
  onLogout: () => Promise<void>;
  authBusy: boolean;
};
