import { useState } from 'react';
import { Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { Eye, EyeOff, Settings2, Sparkles } from 'lucide-react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopBar } from '@/components/TopBar';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { useAuthForm } from './hooks/useAuthForm';
import { styles } from './styles';

export function AuthScreen({
  navigate,
  onAuth,
  onGoogleAuth,
  authBusy,
  scrollToTop,
  authBack = 'profile',
}: ScreenProps) {
  const {
    username,
    email,
    error,
    mode,
    name,
    password,
    setUsername,
    setEmail,
    setError,
    setMode,
    setName,
    setPassword,
    submit,
  } = useAuthForm(onAuth);
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <>
      <TopBar title="Tài khoản" onBack={() => navigate(authBack)} />
      <View style={styles.authGraphic}>
        <Sparkles size={26} color={colors.forest} />
      </View>
      <Text style={styles.authTitle}>
        {mode === 'login' ? 'Mừng bạn quay lại.' : 'Bắt đầu học cùng lenvocab.'}
      </Text>
      <Text style={styles.authDescription}>
        Đăng nhập để lưu từ đã quét, đồng bộ kho từ và ôn tập theo lịch của bạn.
      </Text>
      <Text style={styles.fieldLabel}>Tên đăng nhập</Text>
      <TextInput
        accessibilityLabel="Username"
        placeholder={
          mode === 'login' ? 'Tên đăng nhập hoặc email cũ' : 'Ví dụ: phong_01'
        }
        placeholderTextColor={colors.subtle}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        editable={!authBusy}
        maxLength={mode === 'register' ? 30 : 254}
        style={styles.authInput}
      />
      {mode === 'register' && (
        <Text style={styles.fieldHint}>
          3–30 ký tự: chữ không dấu, số, dấu chấm hoặc gạch dưới.
        </Text>
      )}
      <Text style={styles.fieldLabel}>Mật khẩu</Text>
      <View style={styles.passwordField}>
        <TextInput
          accessibilityLabel="Mật khẩu"
          placeholder="Mật khẩu"
          placeholderTextColor={colors.subtle}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          style={styles.passwordInput}
          editable={!authBusy}
          onSubmitEditing={() => {
            if (!authBusy) submit();
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={passwordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          onPress={() => setPasswordVisible(visible => !visible)}
          style={styles.passwordToggle}
        >
          {passwordVisible ? (
            <EyeOff size={21} color={colors.forest} />
          ) : (
            <Eye size={21} color={colors.forest} />
          )}
        </Pressable>
      </View>
      {mode === 'register' && (
        <>
          <Text style={styles.fieldHint}>
            Ít nhất 6 ký tự. Email và tên hiển thị có thể bỏ trống.
          </Text>
          <Text style={styles.fieldLabel}>Email (không bắt buộc)</Text>
          <TextInput
            accessibilityLabel="Email (không bắt buộc)"
            placeholder="Email (không bắt buộc)"
            placeholderTextColor={colors.subtle}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            maxLength={254}
            editable={!authBusy}
            style={styles.authInput}
          />
          <Text style={styles.fieldLabel}>Tên hiển thị (không bắt buộc)</Text>
          <TextInput
            accessibilityLabel="Tên hiển thị (không bắt buộc)"
            placeholder="Tên hiển thị (không bắt buộc)"
            placeholderTextColor={colors.subtle}
            value={name}
            onChangeText={setName}
            autoComplete="name"
            maxLength={100}
            editable={!authBusy}
            style={styles.authInput}
          />
        </>
      )}
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.authError}>
          {error}
        </Text>
      ) : null}
      <PrimaryButton
        label={
          authBusy
            ? 'Đang xử lý...'
            : mode === 'login'
            ? 'Đăng nhập'
            : 'Tạo tài khoản'
        }
        disabled={authBusy}
        onPress={() => submit()}
      />
      <View style={styles.authDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.fieldHint}>hoặc</Text>
        <View style={styles.dividerLine} />
      </View>
      <PrimaryButton
        label="Tiếp tục với Google"
        variant="secondary"
        disabled={authBusy}
        onPress={() => {
          setError('');
          onGoogleAuth().catch(cause =>
            setError(
              cause instanceof Error
                ? cause.message
                : 'Chưa thể đăng nhập Google.',
            ),
          );
        }}
      />
      <Pressable
        accessibilityRole="button"
        disabled={authBusy}
        onPress={() => {
          Keyboard.dismiss();
          scrollToTop();
          setError('');
          setPasswordVisible(false);
          setMode(mode === 'login' ? 'register' : 'login');
        }}
        style={styles.authSwitch}
      >
        <Text style={styles.authSwitchText}>
          {mode === 'login'
            ? 'Chưa có tài khoản? Đăng ký'
            : 'Đã có tài khoản? Đăng nhập'}
        </Text>
      </Pressable>
      <View style={styles.authNotice}>
        <Settings2 size={19} color={colors.forest} />
        <Text style={styles.authNoticeText}>
          Bạn có thể quét ảnh thật và xem từ vựng minh họa ở chế độ khách. Đăng
          nhập khi muốn lưu từ vào tài khoản.
        </Text>
      </View>
    </>
  );
}
