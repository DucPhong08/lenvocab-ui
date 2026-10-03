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
import type { Asset } from 'react-native-image-picker';
import * as Keychain from 'react-native-keychain';
import useSWR from 'swr';
import { ApiError } from '@/api/client/ApiError';
import type { ScanResult } from '@/api/contracts';
import { authenticate } from '@/api/endpoints/authenticate';
import { confirmFlashcard } from '@/api/endpoints/confirmFlashcard';
import { getMe } from '@/api/endpoints/getMe';
import { gradeReview } from '@/api/endpoints/gradeReview';
import { listFlashcards } from '@/api/endpoints/listFlashcards';
import { reviewToday } from '@/api/endpoints/reviewToday';
import { scanImage } from '@/api/endpoints/scanImage';
import { cardWord } from '@/api/mappers/cardWord';
import { scanWord } from '@/api/mappers/scanWord';
import { getWord } from '@/data/getWord';
import type { Word } from '@/data/scenes';
import { useFeedback } from '@/hooks/useFeedback';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { colors } from '@/theme/theme';
import type { ScanEntry, Screen, ScreenProps } from '@/types/screen';
import { AppTabs } from './AppTabs';
import { ScreenContent } from './ScreenContent';
import { styles } from './styles';

export function AppContent() {
  const [screen, setScreen] = useState<Screen>('home');
  const [sceneId, setSceneId] = useState('desk');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [wordId, setWordId] = useState('notebook');
  const [wordBack, setWordBack] = useState<Screen>('results');
  const [token, setToken] = useState<string | null>(null);
  const [restoringSession, setRestoringSession] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const { data: user = null, mutate: reloadUser, isLoading: loadingUser } = useSWR(token ? ['me', token] : null, ([, key]) => getMe(key), { shouldRetryOnError: false, onError: (error: ApiError) => { if (error.status === 401) logout(); } });
  const { data: cards = [], mutate: reloadCards, isLoading: loadingCards } = useSWR(token ? ['cards', token] : null, ([, key]) => listFlashcards(key), { shouldRetryOnError: false });
  const { data: due = [], mutate: reloadDue, isLoading: loadingDue } = useSWR(token ? ['due', token] : null, ([, key]) => reviewToday(key), { shouldRetryOnError: false });
  const saved = cards.map(card => card.user_flashcard_id);
  const { feedback, showFeedback } = useFeedback();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const scanId = useRef(0);
  const fade = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReduceMotion();
  const navigate = useCallback((next: Screen) => {
    setScreen(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);
  const scrollToEnd = useCallback(
    () => scrollRef.current?.scrollToEnd({ animated: !reduceMotion.current }),
    [reduceMotion],
  );
  const scrollToTop = useCallback(
    () => scrollRef.current?.scrollTo({ y: 0, animated: false }),
    [],
  );
  const logout = async () => {
    try { await Keychain.resetGenericPassword({ service: 'lenvocab.session' }); }
    catch { Alert.alert('Không thể đăng xuất', 'Chưa thể xóa phiên bảo mật. Vui lòng thử lại.'); return; }
    setToken(null);
    setScanResult(null);
    setHistory([]);
    setAsset(null);
    setImageUri(null);
    navigate('home');
  };
  useEffect(() => {
    let active = true;
    Keychain.getGenericPassword({ service: 'lenvocab.session' })
      .then(value => { if (active && value) setToken(value.password); })
      .catch(() => { /* allow guest access if secure storage is unavailable */ })
      .finally(() => { if (active) setRestoringSession(false); });
    return () => { active = false; };
  }, []);
  const onAuth: ScreenProps['onAuth'] = async (mode, email, password, name) => {
    setAuthBusy(true);
    try {
      const result = await authenticate(mode, email, password, name);
      await Keychain.setGenericPassword('session', result.access_token, { service: 'lenvocab.session' });
      setToken(result.access_token);
      navigate('home');
    } finally { setAuthBusy(false); }
  };
  const wordForId = (id: string): Word => {
    if (id.startsWith('scan:') && scanResult) return scanWord(scanResult);
    const card = cards.find(item => item.user_flashcard_id === id);
    return card ? cardWord(card) : getWord(id);
  };
  const toggleSaved = async (id: string) => {
    if (!token) { showFeedback('Đăng nhập để lưu từ và đồng bộ kho học.'); navigate('auth'); return; }
    if (saved.includes(id) || (scanResult && id === scanWord(scanResult).id && cards.some(card => card.keyword.toLowerCase() === scanResult.keyword?.toLowerCase()))) {
      showFeedback('Từ này đã có trong kho của bạn.'); return;
    }
    if (!scanResult || id !== scanWord(scanResult).id) { showFeedback('Hãy quét ảnh thật để tạo thẻ trước khi lưu.'); return; }
    if (saving) return;
    setSaving(true);
    try {
      await confirmFlashcard(token, scanResult);
      await Promise.all([reloadCards(), reloadDue()]);
      showFeedback('Đã lưu từ vào tài khoản của bạn.');
    } catch (error) { Alert.alert('Không thể lưu từ', error instanceof Error ? error.message : 'Thử lại sau.'); }
    finally { setSaving(false); }
  };
  const openWord = (id: string) => {
    setWordBack(screen);
    setWordId(id);
    navigate('word');
  };
  const selectImage = (picked: Asset | null) => {
    setAsset(picked);
    setImageUri(picked?.uri ?? null);
    setScanResult(null);
  };
  const scan = async () => {
    if (scanning) return;
    if (!asset) {
      setScanResult(null);
      navigate('results');
      return;
    }
    setScanning(true);
    try {
      const result = await scanImage(token, asset);
      if (result.status === 'UNRECOGNIZABLE' || !result.keyword) {
        Alert.alert('Chưa nhận diện được', result.message ?? 'Thử ảnh rõ hơn, đủ sáng và có vật thể ở giữa khung hình.');
        return;
      }
      setScanResult(result);
      if (token) reloadUser().catch(() => {});
      setHistory(current => [{ id: ++scanId.current, timestamp: Date.now(), sceneId, imageUri: imageUri ?? undefined, result }, ...current]);
      navigate('results');
    } catch (error) { Alert.alert('Không thể quét ảnh', error instanceof Error ? error.message : 'Vui lòng thử lại.'); }
    finally { setScanning(false); }
  };
  const submitReview = async (id: string, quality: number) => {
    if (!token) return;
    await gradeReview(token, id, quality);
    await Promise.all([reloadDue(), reloadCards()]);
  };
  const openHistory = (entry: ScanEntry) => {
    setSceneId(entry.sceneId);
    setImageUri(entry.imageUri ?? null);
    setScanResult(entry.result ?? null);
    navigate('results');
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
    asset, selectImage, scanResult, scanning, saving,
    user, cards, due, loadingData: loadingCards || loadingDue || loadingUser,
    wordForId, submitReview, onAuth, onLogout: logout, authBusy,
  };
  const showTabs = screen !== 'onboarding' && screen !== 'auth';

  if (restoringSession) return <SafeAreaView style={styles.loading}><ActivityIndicator color={colors.forest} accessibilityLabel="Đang tải phiên đăng nhập" /></SafeAreaView>;

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
            style={[styles.toast, showTabs ? styles.toastWithTabs : styles.toastWithoutTabs]}
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
