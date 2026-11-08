import type { ReviewAttempt } from '@/services/offline/storage';
import type { Asset } from 'react-native-image-picker';
import type {
  DetectedObject,
  Flashcard,
  ReviewCard,
  ScanResult,
  User,
  UserPreferences,
} from '@/api/contracts';
import type { Word } from '@/data/scenes';

export type Screen =
  | 'home'
  | 'camera'
  | 'offline-scan'
  | 'results'
  | 'word'
  | 'saved'
  | 'review'
  | 'flashcards'
  | 'quiz'
  | 'history'
  | 'profile'
  | 'sync'
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
  offline?: boolean;
  cachedCount: number;
  savedAt: string | null;
  reviewQueue: ReviewAttempt[];
  syncReviews: () => Promise<void>;
  discardReview: (reviewId: string) => Promise<void>;
  syncingReviews: boolean;
  syncError: string | null;
  storageError: string | null;
  navigate: (next: Screen) => void;
  practiceWords?: Word[];
  startPractice: (words: Word[]) => void;
  sceneId: string;
  setSceneId: (id: string) => void;
  imageUri: string | null;
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
  onPreferencesChange?: (
    preferences: Partial<UserPreferences>,
  ) => Promise<void>;
  preferencesBusy: boolean;
  toggleSaved: (id: string) => void;
  history: ScanEntry[];
  openHistory: (entry: ScanEntry) => void;
  scrollToEnd: () => void;
  scrollToTop: () => void;
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
  authBack?: Screen;
};
