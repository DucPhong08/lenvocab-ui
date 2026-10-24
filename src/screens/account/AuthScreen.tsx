import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
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
    <View style={styles.page}>
      <TopBar title="Tài khoản" onBack={() => navigate('profile')} />
      <View style={styles.authGraphic}>
        <Sparkles size={45} color={colors.forest} />
      </View>
      <Text style={styles.authTitle}>
        {mode === 'login' ? 'Mừng bạn quay lại.' : 'Bắt đầu học cùng lenvocab.'}
      </Text>
      <Text style={styles.authDescription}>
        Đăng nhập để lưu từ đã quét, đồng bộ kho từ và ôn tập theo lịch của bạn.
      </Text>
      <TextInput
        accessibilityLabel="Username"
        placeholder={
          mode === 'login' ? 'Username hoặc email tài khoản cũ' : 'Username'
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
    </View>
  );
}
