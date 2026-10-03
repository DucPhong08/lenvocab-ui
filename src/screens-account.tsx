import { useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  Bookmark,
  ChevronRight,
  Clock3,
  Settings2,
  Sparkles,
  Volume2,
} from 'lucide-react-native';
import {
  colors,
  Brand,
  Eyebrow,
  PrimaryButton,
  sceneImage,
  ScreenTitle,
  TopBar,
  type ScreenProps,
} from './ui';

const slides = [
  {
    image: 'desk',
    label: '01 / KHÁM PHÁ',
    title: 'Học từ chính thế giới quanh bạn.',
    description:
      'Một góc bàn, một tấm biển hay một trang sách đều có thể trở thành bài học.',
  },
  {
    image: 'kitchen',
    label: '02 / GHI NHỚ',
    title: 'Nhìn thấy. Hiểu rõ. Nhớ lâu.',
    description: 'Học từ vựng cùng hình ảnh, ví dụ và cách dùng gần gũi.',
  },
  {
    image: 'library',
    label: '03 / TIẾN BỘ',
    title: 'Một chút mỗi ngày, giỏi hơn mỗi ngày.',
    description: 'Lưu từ yêu thích, ôn bằng flashcard và thử sức với quiz.',
  },
];

export function ProfileScreen({ navigate, saved, history, user, onLogout }: ScreenProps) {
  return (
    <View style={styles.page}>
      <ScreenTitle
        kicker="GÓC CỦA BẠN"
        title="Hồ sơ của tôi."
        subtitle={user ? `Tài khoản ${user.account_tier} · Đồng bộ từ trên máy chủ` : 'Dùng thử không cần tài khoản · Không lưu bộ từ.'}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Xem trạng thái tài khoản"
        onPress={() => { if (!user) navigate('auth'); }}
        style={styles.identity}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{(user?.display_name || user?.email || 'K')[0].toUpperCase()}</Text>
        </View>
        <View style={styles.fill}>
          <Text style={styles.identityName}>{user?.display_name || 'Khách tham quan'}</Text>
          <Text style={styles.identitySub}>{user ? `${user.email} · ${user.account_tier}` : 'Chạm để đăng nhập hoặc tạo tài khoản'}</Text>
        </View>
        <ChevronRight size={19} color={colors.muted} />
      </Pressable>
      <View style={styles.profileStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{saved.length}</Text>
          <Text style={styles.statCaption}>từ đã lưu</Text>
        </View>
        <View style={styles.verticalLine} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statCaption}>lần quét</Text>
        </View>
      </View>
      <Eyebrow>HỌC TẬP</Eyebrow>
      <View style={styles.menu}>
        <MenuItem
          label="Từ vựng đã lưu"
          icon={<Bookmark size={19} color={colors.forest} />}
          onPress={() => navigate('saved')}
        />
        <MenuItem
          label="Lịch sử quét"
          icon={<Clock3 size={19} color={colors.forest} />}
          onPress={() => navigate('history')}
        />
        <MenuItem
          label="Giới thiệu ứng dụng"
          icon={<Sparkles size={19} color={colors.forest} />}
          onPress={() => navigate('onboarding')}
        />
      </View>
      {user && <View style={styles.menu}>
        <View style={styles.menuItem}>
          <View style={styles.menuIcon}><Volume2 size={19} color={colors.forest} /></View>
          <View style={styles.fill}>
            <Text style={styles.menuText}>Lượt quét còn lại hôm nay</Text>
            <Text style={styles.menuHint}>{user.daily_quota_left} lượt · gói {user.account_tier}</Text>
          </View>
        </View>
      </View>}
      {user ? <PrimaryButton label="Đăng xuất" variant="secondary" onPress={() => onLogout()} /> : <PrimaryButton label="Đăng nhập để đồng bộ" onPress={() => navigate('auth')} />}
      <View style={styles.footer}>
        <Brand />
        <Text style={styles.footerText}>{user ? 'Từ đã lưu và tiến độ ôn tập được giữ trên tài khoản.' : 'Chế độ khách không lưu bộ từ hoặc lịch sử. Ảnh chụp có thể ở bộ nhớ đệm tạm của hệ điều hành.'}</Text>
      </View>
    </View>
  );
}
function MenuItem({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.menuIcon}>{icon}</View>
      <Text style={[styles.menuText, styles.fill]}>{label}</Text>
      <ChevronRight size={18} color={colors.subtle} />
    </Pressable>
  );
}
export function OnboardingScreen({ navigate }: ScreenProps) {
  const [step, setStep] = useState(0);
  const slide = slides[step];
  return (
    <View style={styles.page}>
      <View style={styles.onboardTop}>
        <Brand />
        <Pressable
          accessibilityRole="button"
          onPress={() => navigate('home')}
          style={styles.skip}
        >
          <Text style={styles.skipText}>Bỏ qua</Text>
        </Pressable>
      </View>
      <Image
        source={sceneImage(slide.image)}
        style={styles.onboardImage}
        accessibilityLabel="Cảnh đời thường để học từ vựng"
      />
      <View style={styles.onboardText}>
        <Eyebrow>{slide.label}</Eyebrow>
        <Text style={styles.onboardTitle}>{slide.title}</Text>
        <Text style={styles.onboardDescription}>{slide.description}</Text>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`Trang giới thiệu ${index + 1}`}
              accessibilityState={{ selected: index === step }}
              onPress={() => setStep(index)}
              style={[styles.dot, index === step && styles.activeDot]}
            />
          ))}
        </View>
        <PrimaryButton
          label={step === slides.length - 1 ? 'Khám phá bản demo' : 'Tiếp tục'}
          onPress={() =>
            step === slides.length - 1
              ? navigate('home')
              : setStep(value => value + 1)
          }
        />
      </View>
    </View>
  );
}
export function AuthScreen({ navigate, onAuth, authBusy }: ScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = async () => {
    if (!email.trim() || !password || (mode === 'register' && password.length < 6)) {
      setError('Nhập email và mật khẩu hợp lệ (tối thiểu 6 ký tự khi đăng ký).');
      return;
    }
    setError('');
    try { await onAuth(mode, email, password, name); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể đăng nhập. Vui lòng thử lại.'); }
  };
  return (
    <View style={styles.page}>
      <TopBar title="Tài khoản" onBack={() => navigate('profile')} />
      <View style={styles.authGraphic}><Sparkles size={45} color={colors.forest} /></View>
      <Text style={styles.authTitle}>{mode === 'login' ? 'Mừng bạn quay lại.' : 'Bắt đầu học cùng lenvocab.'}</Text>
      <Text style={styles.authDescription}>Đăng nhập để quét ảnh bằng AI, lưu từ trên máy chủ và ôn tập theo lịch của bạn.</Text>
      {mode === 'register' && <TextInput accessibilityLabel="Tên hiển thị" placeholder="Tên hiển thị" placeholderTextColor={colors.subtle} value={name} onChangeText={setName} autoComplete="name" style={styles.authInput} />}
      <TextInput accessibilityLabel="Email" placeholder="Email" placeholderTextColor={colors.subtle} value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" style={styles.authInput} />
      <TextInput accessibilityLabel="Mật khẩu" placeholder="Mật khẩu" placeholderTextColor={colors.subtle} value={password} onChangeText={setPassword} secureTextEntry autoComplete={mode === 'login' ? 'current-password' : 'new-password'} style={styles.authInput} onSubmitEditing={() => submit()} />
      {error ? <Text accessibilityLiveRegion="polite" style={styles.authError}>{error}</Text> : null}
      <PrimaryButton label={authBusy ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'} disabled={authBusy} onPress={() => submit()} />
      <Pressable accessibilityRole="button" onPress={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }} style={styles.authSwitch}>
        <Text style={styles.authSwitchText}>{mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}</Text>
      </Pressable>
      <View style={styles.authNotice}>
        <Settings2 size={19} color={colors.forest} />
        <Text style={styles.authNoticeText}>Không muốn đăng nhập? Bạn vẫn xem được từ vựng minh họa mà không lưu dữ liệu.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  page: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 32 },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 17,
    gap: 13,
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginBottom: 17,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 23, color: colors.forest, fontWeight: '800' },
  identityName: { fontSize: 17, fontWeight: '800', color: colors.ink },
  identitySub: { fontSize: 12, color: colors.muted, marginTop: 4 },
  profileStats: {
    flexDirection: 'row',
    backgroundColor: colors.forest,
    borderRadius: 20,
    marginBottom: 29,
    padding: 22,
    alignItems: 'center',
  },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.lime },
  statCaption: { color: colors.surface, fontSize: 12 },
  verticalLine: { backgroundColor: '#FFFFFF40', width: 1, height: 32 },
  menu: {
    marginTop: 12,
    marginBottom: 28,
    borderRadius: 19,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  menuItem: {
    minHeight: 61,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  menuIcon: {
    width: 35,
    height: 35,
    backgroundColor: colors.pale,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  menuHint: { fontSize: 11, color: colors.muted, marginTop: 3 },
  footer: { alignItems: 'center', paddingTop: 7, gap: 11 },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.muted,
  },
  onboardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  skip: {
    minWidth: 65,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: { color: colors.muted, fontWeight: '700', fontSize: 13 },
  onboardImage: {
    width: '100%',
    height: 290,
    borderRadius: 26,
    marginBottom: 28,
  },
  onboardText: { gap: 15 },
  onboardTitle: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: colors.ink,
  },
  onboardDescription: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  dots: { flexDirection: 'row', gap: 7, marginVertical: 19 },
  dot: { width: 23, height: 8, borderRadius: 5, backgroundColor: colors.line },
  activeDot: { width: 35, backgroundColor: colors.forest },
  authGraphic: {
    marginTop: 59,
    marginBottom: 35,
    width: 120,
    height: 120,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lime,
  },
  authTitle: {
    fontSize: 33,
    lineHeight: 41,
    color: colors.ink,
    fontWeight: '800',
    marginBottom: 15,
  },
  authDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.muted,
    marginBottom: 30,
  },
  authInput: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 16, minHeight: 54, color: colors.ink, fontSize: 15, marginBottom: 12 },
  authError: { color: colors.error, fontSize: 13, marginBottom: 14 },
  authSwitch: { padding: 15, alignItems: 'center', marginBottom: 12 },
  authSwitchText: { color: colors.forest, fontWeight: '700' },
  authNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.pale,
    borderRadius: 17,
    marginBottom: 25,
  },
  authNoticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.forest,
  },
});
