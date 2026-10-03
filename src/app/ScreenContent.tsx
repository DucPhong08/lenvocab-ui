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

export function ScreenContent({
  screen,
  props,
}: {
  screen: Screen;
  props: ScreenProps;
}) {
  switch (screen) {
    case 'home':
      return <HomeScreen {...props} />;
    case 'camera':
      return <CameraScreen {...props} />;
    case 'results':
      return <ResultsScreen {...props} />;
    case 'word':
      return <WordScreen {...props} />;
    case 'saved':
      return <SavedScreen {...props} />;
    case 'review':
      return <ReviewScreen {...props} />;
    case 'flashcards':
      return <FlashcardsScreen {...props} />;
    case 'quiz':
      return <QuizScreen {...props} />;
    case 'history':
      return <HistoryScreen {...props} />;
    case 'profile':
      return <ProfileScreen {...props} />;
    case 'onboarding':
      return <OnboardingScreen {...props} />;
    case 'auth':
      return <AuthScreen {...props} />;
  }
}
