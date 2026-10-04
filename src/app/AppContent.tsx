import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark } from 'lucide-react-native';
import { gradeReview } from '@/api/endpoints/gradeReview';
import { useFeedback } from '@/hooks/useFeedback';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { scheduleDailyStudyReminder } from '@/services/notifications/scheduleDailyStudyReminder';
import { colors } from '@/theme/theme';
import type { Screen, ScreenProps } from '@/types/screen';
import { AppTabs } from './AppTabs';
import { ScreenContent } from './ScreenContent';
import { useLearningData } from './hooks/useLearningData';
import { useScanFlow } from './hooks/useScanFlow';
import { useSession } from './hooks/useSession';
import { useVocabularyLibrary } from './hooks/useVocabularyLibrary';
import { styles } from './styles';

export function AppContent() {
  const [screen, setScreen] = useState<Screen>('home');
  const [sceneId, setSceneId] = useState('desk');
  const [wordId, setWordId] = useState('notebook');
  const [wordBack, setWordBack] = useState<Screen>('results');
  const { feedback, showFeedback } = useFeedback();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const fade = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReduceMotion();
  const navigate = useCallback((next: Screen) => {
    setScreen(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);
  const { authBusy, restoringSession, signIn, signOut, token } = useSession();
  const logoutSession = useCallback(async () => {
    try {
      await signOut();
    } catch {
      Alert.alert(
        'Không thể đăng xuất',
        'Chưa thể xóa phiên bảo mật. Vui lòng thử lại.',
      );
      return false;
    }
    return true;
  }, [signOut]);
  const {
    cards,
    dataError,
    due,
    loadingData,
    reloadCards,
    reloadData,
    reloadDue,
    reloadUser,
    user,
  } = useLearningData(token, logoutSession);
  const {
    asset,
    history,
    imageUri,
    openHistory,
    resetScan,
    scan,
    scanning,
    scanResult,
    selectImage,
    setImageUri,
  } = useScanFlow({ navigate, reloadUser, sceneId, setSceneId, token });
  const logout = useCallback(async () => {
    if (!(await logoutSession())) return;
    resetScan();
    navigate('home');
  }, [logoutSession, navigate, resetScan]);
  const { saved, saving, toggleSaved, wordForId } = useVocabularyLibrary({
    cards,
    navigate,
    reloadCards,
    reloadDue,
    scanResult,
    showFeedback,
    token,
  });
  const scrollToEnd = useCallback(
    () => scrollRef.current?.scrollToEnd({ animated: !reduceMotion.current }),
    [reduceMotion],
  );
  const scrollToTop = useCallback(
    () => scrollRef.current?.scrollTo({ y: 0, animated: false }),
    [],
  );
  useEffect(() => {
    if (token) scheduleDailyStudyReminder().catch(() => {});
  }, [token]);
  const onAuth: ScreenProps['onAuth'] = async (mode, email, password, name) => {
    await signIn(mode, email, password, name);
    navigate('home');
  };
  const openWord = (id: string) => {
    setWordBack(screen);
    setWordId(id);
    navigate('word');
  };
  const submitReview = async (id: string, quality: number) => {
    if (!token) return;
    await gradeReview(token, id, quality);
    await Promise.all([reloadDue(), reloadCards()]);
  };
  const goBack = useCallback(() => {
    if (screen === 'home') return false;
    if (screen === 'word') navigate(wordBack);
    else if (screen === 'results') navigate('camera');
    else if (screen === 'quiz' || screen === 'flashcards') navigate('review');
    else if (screen === 'auth') navigate('profile');
    else navigate('home');
    return true;
  }, [screen, wordBack, navigate]);

  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => listener.remove();
  }, [goBack]);
  useEffect(() => {
    if (reduceMotion.current) {
      fade.setValue(1);
      return;
    }
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [screen, fade, reduceMotion]);
  const props: ScreenProps = {
    navigate,
    sceneId,
    setSceneId,
    imageUri,
    setImageUri,
    scan,
    wordId,
    wordBack,
    openWord,
    saved,
    toggleSaved,
    history,
    openHistory,
    scrollToEnd,
    scrollToTop,
    asset,
    selectImage,
    scanResult,
    scanning,
    saving,
    user,
    cards,
    due,
    loadingData,
    dataError,
    reloadData,
    wordForId,
    submitReview,
    onAuth,
    onLogout: logout,
    authBusy,
  };
  const showTabs = screen !== 'onboarding' && screen !== 'auth';

  if (restoringSession)
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator
          color={colors.forest}
          accessibilityLabel="Đang tải phiên đăng nhập"
        />
      </SafeAreaView>
    );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fade,
              transform: [
                {
                  translateY: fade.interpolate({
                    inputRange: [0, 1],
                    outputRange: [7, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            key={screen}
          >
            <ScreenContent screen={screen} props={props} />
          </ScrollView>
        </Animated.View>
        {feedback && (
          <View
            style={[
              styles.toast,
              showTabs ? styles.toastWithTabs : styles.toastWithoutTabs,
            ]}
            accessibilityLiveRegion="polite"
          >
            <Bookmark size={16} color={colors.surface} />
            <Text style={styles.toastText}>{feedback}</Text>
          </View>
        )}
        {showTabs && (
          <AppTabs screen={screen} wordBack={wordBack} navigate={navigate} />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
