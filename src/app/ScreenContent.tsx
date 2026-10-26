import type { ComponentType } from 'react';
import { View } from 'react-native';
import { layout } from '@/theme/theme';
import { AuthScreen } from '@/screens/account/AuthScreen';
import { OnboardingScreen } from '@/screens/account/OnboardingScreen';
import { ProfileScreen } from '@/screens/account/ProfileScreen';
import { CameraScreen } from '@/screens/discover/CameraScreen';
import { HomeScreen } from '@/screens/discover/HomeScreen';
import { ResultsScreen } from '@/screens/discover/ResultsScreen';
import { WordScreen } from '@/screens/discover/WordScreen';
import { FlashcardsScreen } from '@/screens/learn/FlashcardsScreen';
import { HistoryScreen } from '@/screens/learn/HistoryScreen';
import { QuizScreen } from '@/screens/learn/QuizScreen';
import { ReviewScreen } from '@/screens/learn/ReviewScreen';
import { SavedScreen } from '@/screens/learn/SavedScreen';
import type { Screen, ScreenProps } from '@/types/screen';

const screens = {
  home: HomeScreen,
  camera: CameraScreen,
  results: ResultsScreen,
  word: WordScreen,
  saved: SavedScreen,
  review: ReviewScreen,
  flashcards: FlashcardsScreen,
  quiz: QuizScreen,
  history: HistoryScreen,
  profile: ProfileScreen,
  onboarding: OnboardingScreen,
  auth: AuthScreen,
} satisfies Record<Screen, ComponentType<ScreenProps>>;

export function ScreenContent({
  screen,
  props,
}: {
  screen: Screen;
  props: ScreenProps;
}) {
  const Content = screens[screen];
  return (
    <View style={layout.page}>
      <Content {...props} />
    </View>
  );
}
