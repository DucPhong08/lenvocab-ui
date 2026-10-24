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
import { ApiError } from '@/api/client/ApiError';
import { updatePreferences } from '@/api/endpoints/updatePreferences';
import { AudioContext } from '@/hooks/audioContext';
import { linkGoogle } from '@/api/endpoints/googleAuth';
import { googleIdToken } from '@/services/auth/googleSignIn';
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
  const pendingSave = useRef<string | null>(null);
  const [sceneId, setSceneId] = useState('desk');
  const [wordId, setWordId] = useState('notebook');
  const [wordBack, setWordBack] = useState<Screen>('results');
  const { feedback, showFeedback } = useFeedback();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const fade = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReduceMotion();
  const navigate = useCallback((next: Screen) => {
    if (next !== 'auth') pendingSave.current = null;
    setScreen(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);
  const { authBusy, restoringSession, signIn, signInGoogle, signOut, token } =
    useSession();
  const currentToken = useRef(token);
  currentToken.current = token;
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
    applyReview,
    cards,
    totalSaved,
    hasMoreCards,
    loadingMoreCards,
    loadMoreCards,
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
    selectObject,
    selectingObject,
    setImageUri,
  } = useScanFlow({
    navigate,
    onUnauthorized: logoutSession,
    reloadUser,
    sceneId,
    setSceneId,
    token,
  });
  const previousToken = useRef(token);
  useEffect(() => {
    if (previousToken.current && previousToken.current !== token) {
      resetScan();
      navigate('home');
    }
    previousToken.current = token;
  }, [navigate, resetScan, token]);
  const logout = useCallback(async () => {
    if (!(await logoutSession())) return;
    resetScan();
    navigate('home');
  }, [logoutSession, navigate, resetScan]);
  const { saved, saving, toggleSaved, wordForId, currentScanSaved } =
    useVocabularyLibrary({
      cards,
      due,
      requestSignIn: id => {
        pendingSave.current = id;
        navigate('auth');
      },
      onUnauthorized: logoutSession,
      reloadCards,
      reloadDue,
      scanResult,
      imageUri,
      showFeedback,
      token,
    });
  useEffect(() => {
    if (!token || screen !== 'auth') return;
    const id = pendingSave.current;
    navigate(id ? 'results' : 'home');
    if (id) toggleSaved(id);
  }, [navigate, screen, token, toggleSaved]);
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
  const onAuth: ScreenProps['onAuth'] = async (
    mode,
    username,
    password,
    name,
    email,
  ) => {
    await signIn(mode, username, password, name, email);
  };
  const openWord = (id: string) => {
    setWordBack(screen);
    setWordId(id);
    navigate('word');
  };
  const submitReview = async (
    id: string,
    quality: number,
    reviewId: string,
  ) => {
    if (!token) return;
    const requestToken = token;
    try {
      const result = await gradeReview(token, id, quality, reviewId);
      if (currentToken.current !== requestToken) return;
      await applyReview(result);
      if (due.length <= 1) reloadData().catch(() => {});
    } catch (error) {
      if (currentToken.current !== requestToken) return;
      if (error instanceof ApiError && error.status === 401) {
        await logoutSession();
      }
      throw error;
    }
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
  const [preferencesBusy, setPreferencesBusy] = useState(false);
  const onVoiceSpeedChange = async (speed: number) => {
    if (!token || preferencesBusy) return;
    const requestToken = token;
    setPreferencesBusy(true);
    try {
      await updatePreferences(token, { voice_speed: speed });
      if (currentToken.current === requestToken) await reloadUser();
    } catch (error) {
      if (currentToken.current !== requestToken) return;
      if (error instanceof ApiError && error.status === 401)
        await logoutSession();
      else
        Alert.alert(
          'Chưa đổi được tốc độ đọc',
          error instanceof Error ? error.message : 'Vui lòng thử lại.',
        );
    } finally {
      setPreferencesBusy(false);
    }
  };
  const [googleLinkBusy, setGoogleLinkBusy] = useState(false);
  const onGoogleLink = async () => {
    if (!token || googleLinkBusy) return;
    const requestToken = token;
    setGoogleLinkBusy(true);
    try {
      const idToken = await googleIdToken();
      if (!idToken || currentToken.current !== requestToken) return;
      await linkGoogle(requestToken, idToken);
      if (currentToken.current !== requestToken) return;
      await reloadUser();
      Alert.alert(
        'Đã liên kết Google',
        'Lần sau bạn có thể đăng nhập bằng tài khoản Google này.',
      );
    } catch (error) {
      if (currentToken.current !== requestToken) return;
      if (error instanceof ApiError && error.status === 401)
        await logoutSession();
      else
        Alert.alert(
          'Chưa liên kết được Google',
          error instanceof Error ? error.message : 'Vui lòng thử lại.',
        );
    } finally {
      setGoogleLinkBusy(false);
    }
  };
  const props: ScreenProps = {
    token,
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
    totalSaved,
    hasMoreCards,
    loadingMoreCards,
    loadMoreCards,
    onVoiceSpeedChange,
    preferencesBusy,
    toggleSaved,
    history,
    openHistory,
    scrollToEnd,
    scrollToTop,
    asset,
    selectImage,
    selectObject,
    selectingObject,
    scanResult,
    scanning,
    saving,
    currentScanSaved,
    user,
    cards,
    due,
    loadingData,
    dataError,
    reloadData,
    wordForId,
    submitReview,
    onAuth,
    onGoogleAuth: signInGoogle,
    onGoogleLink,
    googleLinkBusy,
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
    <AudioContext.Provider
      value={{
        token,
        speed: user?.preferences?.voice_speed ?? 1,
        onUnauthorized: logoutSession,
      }}
    >
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
    </AudioContext.Provider>
  );
}
