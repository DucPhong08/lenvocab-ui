import type { ReactNode } from 'react';
import type { Asset } from 'react-native-image-picker';
import type { Flashcard, ReviewCard, ScanResult, User } from './api';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ChevronRight,
  BookOpen,
  Sparkles,
} from 'lucide-react-native';
import { getScene, type Word } from './data';

export const colors = {
  background: '#F6F8F2',
  surface: '#FFFFFF',
  forest: '#194D40',
  deep: '#14392F',
  ink: '#203B34',
  muted: '#61746B',
  subtle: '#87978D',
  lime: '#D8F18D',
  pale: '#EAF2E5',
  line: '#DDE7DA',
  success: '#2D754F',
  error: '#BB4C3B',
  warning: '#946132',
};
export const sceneImages: Record<string, ImageSourcePropType> = {
  desk: require('../assets/scenes/desk.png'),
  kitchen: require('../assets/scenes/kitchen.png'),
  street: require('../assets/scenes/street.png'),
  library: require('../assets/scenes/library.png'),
};
export const sceneImage = (id: string) => sceneImages[id] ?? sceneImages.desk;
export const shadow = {
  shadowColor: '#244534',
  shadowOpacity: 0.08,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 7 },
  elevation: 3,
} as const;

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
  toggleSaved: (id: string) => void;
  history: ScanEntry[];
  openHistory: (entry: ScanEntry) => void;
  scrollToEnd: () => void;
  scrollToTop: () => void;
  asset: Asset | null;
  selectImage: (asset: Asset | null) => void;
  scanResult: ScanResult | null;
  scanning: boolean;
  saving: boolean;
  user: User | null;
  cards: Flashcard[];
  due: ReviewCard[];
  loadingData: boolean;
  wordForId: (id: string) => Word;
  submitReview: (id: string, quality: number) => Promise<void>;
  onAuth: (mode: 'login' | 'register', email: string, password: string, name: string) => Promise<void>;
  onLogout: () => Promise<void>;
  authBusy: boolean;
};

export function Brand() {
  return (
    <View style={styles.brand}>
      <View style={styles.brandMark}>
        <Sparkles size={18} color={colors.forest} strokeWidth={2.5} />
      </View>
      <Text style={styles.brandText}>
        lenvocab<Text style={{ color: colors.success }}>.</Text>
      </Text>
    </View>
  );
}
export function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <Text style={[styles.eyebrow, light && { color: colors.lime }]}>
      {children}
    </Text>
  );
}
export function ScreenTitle({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.titleBlock}>
      <Eyebrow>{kicker}</Eyebrow>
      <Text style={styles.screenTitle}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}
export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        disabled && { opacity: 0.45 },
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.primaryButtonText,
          variant === 'secondary' && { color: colors.forest },
        ]}
      >
        {label}
      </Text>
      {icon ?? (
        <ArrowRight
          size={19}
          color={variant === 'primary' ? colors.surface : colors.forest}
        />
      )}
    </Pressable>
  );
}
export function IconButton({
  label,
  onPress,
  icon,
  light = false,
}: {
  label: string;
  onPress: () => void;
  icon: ReactNode;
  light?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        light && { backgroundColor: '#FFFFFF22' },
        pressed && styles.pressed,
      ]}
    >
      {icon}
    </Pressable>
  );
}
export function TopBar({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack: () => void;
  action?: ReactNode;
}) {
  return (
    <View style={styles.topBar}>
      <IconButton
        label="Quay lại"
        onPress={onBack}
        icon={<ArrowLeft size={21} color={colors.ink} />}
      />
      <Text style={styles.topBarTitle}>{title}</Text>
      <View style={styles.topBarEnd}>{action}</View>
    </View>
  );
}
export function SectionHeader({
  kicker,
  title,
  action,
  onAction,
}: {
  kicker?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.fill}>
        {kicker && <Eyebrow>{kicker}</Eyebrow>}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action && onAction && (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [
            styles.sectionAction,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.sectionActionText}>{action}</Text>
          <ArrowRight size={15} color={colors.forest} />
        </Pressable>
      )}
    </View>
  );
}
export function WordRow({
  word,
  saved,
  onOpen,
  onSave,
}: {
  word: Word;
  saved: boolean;
  onOpen: () => void;
  onSave?: () => void;
}) {
  return (
    <View style={styles.wordRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Xem từ ${word.term}, nghĩa là ${word.meaning}`}
        onPress={onOpen}
        style={({ pressed }) => [styles.wordMain, pressed && styles.pressed]}
      >
        <View style={styles.wordInitial}>
          <Text style={styles.wordInitialText}>
            {word.term[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.fill}>
          <Text style={styles.wordTerm}>{word.term}</Text>
          <Text style={styles.wordMeaning} numberOfLines={1}>
            {word.type} · {word.meaning}
          </Text>
        </View>
        <ChevronRight size={16} color={colors.subtle} />
      </Pressable>
      {onSave && <Pressable
        accessibilityRole="button"
        accessibilityLabel={saved ? `Đã lưu ${word.term}` : `Lưu ${word.term}`}
        accessibilityState={{ selected: saved }}
        disabled={saved}
        onPress={onSave}
        style={({ pressed }) => [styles.bookmark, pressed && styles.pressed]}
      >
        <Bookmark
          size={20}
          color={saved ? colors.forest : colors.muted}
          fill={saved ? colors.lime : 'none'}
        />
      </Pressable>}
    </View>
  );
}
export function EmptyState({
  title,
  description,
  onPress,
  action,
}: {
  title: string;
  description: string;
  onPress?: () => void;
  action?: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <BookOpen size={28} color={colors.forest} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {action && onPress && (
        <PrimaryButton
          label={action}
          onPress={onPress}
          variant="secondary"
          style={styles.emptyAction}
        />
      )}
    </View>
  );
}
export function SceneThumbnail({
  id,
  onPress,
  selected,
}: {
  id: string;
  onPress: () => void;
  selected?: boolean;
}) {
  const scene = getScene(id);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chọn cảnh ${scene.title}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.sceneChoice,
        selected && styles.sceneSelected,
        pressed && styles.pressed,
      ]}
    >
      <Image source={sceneImage(id)} style={styles.sceneThumb} />
      <Text style={styles.sceneLabel} numberOfLines={1}>
        {scene.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  emptyAction: { alignSelf: 'stretch', marginTop: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.forest,
    letterSpacing: -1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: colors.success,
    textTransform: 'uppercase',
  },
  titleBlock: { gap: 9, marginBottom: 25 },
  screenTitle: {
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '800',
    letterSpacing: -1.2,
    color: colors.ink,
  },
  subtitle: { fontSize: 15, lineHeight: 23, color: colors.muted },
  primaryButton: {
    minHeight: 54,
    paddingHorizontal: 20,
    borderRadius: 17,
    backgroundColor: colors.forest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryButton: { backgroundColor: colors.pale },
  primaryButtonText: { fontSize: 15, fontWeight: '800', color: colors.surface },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  topBarTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  topBarEnd: { width: 44, alignItems: 'flex-end' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.6,
    marginTop: 5,
  },
  sectionAction: {
    minHeight: 44,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  sectionActionText: { fontSize: 13, fontWeight: '700', color: colors.forest },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 17,
    marginBottom: 9,
    paddingLeft: 12,
    paddingRight: 5,
    borderWidth: 1,
    borderColor: colors.line,
  },
  wordMain: {
    flex: 1,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  wordInitial: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordInitialText: { fontSize: 22, fontWeight: '800', color: colors.forest },
  wordTerm: { fontSize: 16, fontWeight: '800', color: colors.ink },
  wordMeaning: { fontSize: 12, color: colors.muted, marginTop: 3 },
  bookmark: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: colors.muted,
  },
  sceneChoice: {
    width: 110,
    backgroundColor: colors.surface,
    padding: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sceneSelected: { borderColor: colors.forest },
  sceneThumb: { height: 68, width: '100%', borderRadius: 10 },
  sceneLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 7,
    color: colors.ink,
  },
});
