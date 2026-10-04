export type UserPreferences = {
  preferred_voice_id: string;
  voice_speed: number;
  daily_review_goal: number;
  target_language: string;
  max_detected_objects: number;
};

export type AccountTier = 'FREE' | 'PREMIUM';
export type FlashcardStatus = 'DRAFT' | 'CONFIRMED';
export type ScanStatus = 'OK' | 'FALLBACK' | 'AI_COULD_NOT_RECOGNIZE';
export type ScanSource = 'redis' | 'mongodb' | 'bedrock';

export type UserPreferencesResponse = {
  preferences: UserPreferences;
  account_tier: AccountTier;
  allowed_voices: string[];
  allowed_speeds: number[];
  allow_neural_voice: boolean;
  max_daily_review_goal: number;
};

export type User = {
  id: string;
  email: string;
  display_name: string | null;
  account_tier: AccountTier;
  daily_quota_left: number;
  is_active: boolean;
  preferences: UserPreferences;
};

export type Box = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type DetectedObject = {
  keyword: string;
  confidence: number;
  bounding_box: Box | null;
  categories: string[];
  aliases: string[];
  parents: string[];
};

export type ScanResult = {
  status: ScanStatus;
  keyword: string | null;
  pronunciation: string | null;
  meaning_vi: string | null;
  example_1: string | null;
  example_2: string | null;
  related_words: string[];
  aliases: string[];
  categories: string[];
  parents: string[];
  audio_base64: string | null;
  confidence: number;
  detected_objects: DetectedObject[];
  bounding_box: Box | null;
  source: ScanSource | null;
  is_draft: boolean;
  message: string | null;
};

export type Flashcard = {
  user_flashcard_id: string;
  global_flashcard_id: string;
  keyword: string;
  pronunciation: string | null;
  meaning_vi: string;
  example_1: string;
  example_2: string;
  related_words: string[];
  audio_base64: string | null;
  status: FlashcardStatus;
  interval: number;
  repetitions: number;
  efactor: number;
  next_review_date: string;
};

export type ReviewCard = Omit<Flashcard, 'global_flashcard_id' | 'status'>;

export type SubmitReviewResponse = {
  user_flashcard_id: string;
  interval_after: number;
  repetitions_after: number;
  efactor_after: number;
  next_review_date: string;
  message: string;
};
