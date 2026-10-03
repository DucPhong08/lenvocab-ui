export type User = {
  id: string;
  email: string;
  display_name: string | null;
  account_tier: string;
  daily_quota_left: number;
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
};

export type ScanResult = {
  status: string;
  keyword: string | null;
  pronunciation: string | null;
  meaning_vi: string | null;
  example_1: string | null;
  example_2: string | null;
  related_words: string[];
  audio_base64: string | null;
  detected_objects: DetectedObject[];
  bounding_box: Box | null;
  message: string | null;
};

export type Flashcard = {
  user_flashcard_id: string;
  keyword: string;
  pronunciation: string | null;
  meaning_vi: string;
  example_1: string;
  example_2: string;
  related_words: string[];
  audio_base64: string | null;
  status?: string;
  repetitions?: number;
  next_review_date?: string;
};

export type ReviewCard = Flashcard;

