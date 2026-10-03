import { Pressable, Text, TextInput, View } from 'react-native';
import { Settings2, Sparkles } from 'lucide-react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopBar } from '@/components/TopBar';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { useAuthForm } from './hooks/useAuthForm';
import { styles } from './styles';

export function AuthScreen({ navigate, onAuth, authBusy }: ScreenProps) {
  const {
    email,
    error,
    mode,
    name,
    password,
    setEmail,
    setError,
    setMode,
    setName,
    setPassword,
    submit,
  } = useAuthForm(onAuth);
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
