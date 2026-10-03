import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Bookmark,
  Camera,
  Home,
  Layers3,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { getWord } from './src/data';
import {
  CameraScreen,
  HomeScreen,
  ResultsScreen,
  WordScreen,
} from './src/screens-discover';
import {
  FlashcardsScreen,
  HistoryScreen,
  QuizScreen,
  ReviewScreen,
  SavedScreen,
} from './src/screens-learn';
import {
  AuthScreen,
  OnboardingScreen,
  ProfileScreen,
} from './src/screens-account';
import {
  colors,
  type ScanEntry,
  type Screen,
  type ScreenProps,
} from './src/ui';

const tabs: { screen: Screen; label: string; icon: LucideIcon }[] = [
  { screen: 'home', label: 'Trang chủ', icon: Home },
  { screen: 'saved', label: 'Từ đã lưu', icon: Bookmark },
  { screen: 'camera', label: 'Quét ảnh', icon: Camera },
  { screen: 'review', label: 'Ôn tập', icon: Layers3 },
  { screen: 'profile', label: 'Cá nhân', icon: UserRound },
];

function AppContent() {
  const [screen, setScreen] = useState<Screen>('home');
  const [sceneId, setSceneId] = useState('desk');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [wordId, setWordId] = useState('notebook');
  const [wordBack, setWordBack] = useState<Screen>('results');
  const [saved, setSaved] = useState<string[]>([]);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [feedback, setFeedback] = useState('');
  const scrollRef = useRef<ScrollViewInstance>(null);
  const scanId = useRef(0);
  const fade = useRef(new Animated.Value(1)).current;
  const reduceMotion = useRef(false);
  const navigate = useCallback((next: Screen) => {
    setScreen(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);
  const scrollToEnd = useCallback(
    () => scrollRef.current?.scrollToEnd({ animated: !reduceMotion.current }),
    [],
  );
  const scrollToTop = useCallback(
    () => scrollRef.current?.scrollTo({ y: 0, animated: false }),
    [],
  );
  const toggleSaved = (id: string) => {
    const wasSaved = saved.includes(id);
    setSaved(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id],
    );
    const message = `${getWord(id).term}: ${
      wasSaved ? 'đã bỏ lưu' : 'đã lưu vào bộ từ'
    }`;
    setFeedback(message);
    AccessibilityInfo.announceForAccessibility(message);
  };
  const openWord = (id: string) => {
    setWordBack(screen);
    setWordId(id);
    if (screen !== 'results') {
      setSceneId(getWord(id).scene);
      setImageUri(null);
    }
    navigate('word');
  };
  const scan = () => {
    setHistory(current => [
      {
        id: ++scanId.current,
        timestamp: Date.now(),
        sceneId,
        imageUri: imageUri ?? undefined,
      },
      ...current,
    ]);
    navigate('results');
  };
  const openHistory = (entry: ScanEntry) => {
    setSceneId(entry.sceneId);
    setImageUri(entry.imageUri ?? null);
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
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      reduceMotion.current = value;
    });
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      value => {
        reduceMotion.current = value;
      },
    );
    return () => listener.remove();
  }, []);
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
  }, [screen, fade]);
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(''), 2600);
    return () => clearTimeout(timer);
  }, [feedback]);

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
  };
  const activeTab =
    screen === 'word'
      ? wordBack === 'results'
        ? 'camera'
        : wordBack
      : screen === 'results' || screen === 'history'
      ? 'camera'
      : screen === 'quiz' || screen === 'flashcards'
      ? 'review'
      : screen;
  const showTabs = screen !== 'onboarding' && screen !== 'auth';

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
          <View accessibilityRole="tablist" style={styles.tabBar}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.screen;
              return (
                <Pressable
                  key={tab.screen}
                  accessibilityRole="tab"
                  accessibilityLabel={tab.label}
                  accessibilityState={{ selected: active }}
                  onPress={() => navigate(tab.screen)}
                  style={({ pressed }) => [
                    styles.tab,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View
                    style={[
                      styles.tabIcon,
                      tab.screen === 'camera' && styles.cameraTab,
                      active && tab.screen !== 'camera' && styles.activeTabIcon,
                    ]}
                  >
                    <Icon
                      size={tab.screen === 'camera' ? 23 : 21}
                      color={
                        tab.screen === 'camera'
                          ? colors.surface
                          : active
                          ? colors.forest
                          : colors.subtle
                      }
                      fill={
                        active && tab.screen === 'home' ? colors.forest : 'none'
                      }
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[styles.tabLabel, active && styles.activeTabLabel]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ScreenContent({
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
export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  tabBar: {
    minHeight: 70,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabIcon: {
    width: 37,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeTabIcon: { backgroundColor: colors.pale },
  cameraTab: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: colors.forest,
    marginTop: -8,
  },
  tabLabel: { color: colors.subtle, fontSize: 10, fontWeight: '700' },
  activeTabLabel: { color: colors.forest, fontWeight: '800' },
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    minHeight: 45,
    borderRadius: 14,
    backgroundColor: colors.deep,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 6,
    shadowColor: colors.deep,
    shadowOpacity: 0.18,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  toastWithTabs: { bottom: 78 },
  toastWithoutTabs: { bottom: 12 },
  toastText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});
