import { useState } from 'react';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { Eye, EyeOff, Settings2, Sparkles } from 'lucide-react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopBar } from '@/components/TopBar';
import { useI18n } from '@/i18n';
import type { ScreenProps } from '@/types/screen';
import { useAuthForm } from './hooks/useAuthForm';
import { errorMessage } from '@/utils/errorMessage';
import { useStyles } from './styles/styles';

export function AuthScreen({
  navigate,
  onAuth,
  onGoogleAuth,
  authBusy,
  scrollToTop,
  authBack = 'profile',
}: ScreenProps) {
  const { styles, colors } = useStyles();
  const { strings } = useI18n();
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
      <TopBar title={strings.auth.title} onBack={() => navigate(authBack)} />
      <View style={styles.authGraphic}>
        <Sparkles size={26} color={colors.primaryText} />
      </View>
      <Text style={styles.authTitle}>
        {mode === 'login' ? strings.auth.welcomeBack : strings.auth.startLearning}
      </Text>
      <Text style={styles.authDescription}>
        {strings.auth.description}
      </Text>
      <Text style={styles.fieldLabel}>{strings.auth.usernameLabel}</Text>
      <TextInput
        accessibilityLabel="Username"
        placeholder={
          mode === 'login' ? strings.auth.usernameLoginPlaceholder : strings.auth.usernameRegisterPlaceholder
        }
        placeholderTextColor={colors.muted}
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
          {strings.auth.usernameHint}
        </Text>
      )}
      <Text style={styles.fieldLabel}>{strings.auth.passwordLabel}</Text>
      <View style={styles.passwordField}>
        <TextInput
          accessibilityLabel="Mật khẩu"
          placeholder={strings.auth.passwordPlaceholder}
          placeholderTextColor={colors.muted}
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
          accessibilityLabel={passwordVisible ? strings.auth.hidePassword : strings.auth.showPassword}
          onPress={() => setPasswordVisible(visible => !visible)}
          style={styles.passwordToggle}
        >
          {passwordVisible ? (
            <EyeOff size={21} color={colors.primaryText} />
          ) : (
            <Eye size={21} color={colors.primaryText} />
          )}
        </Pressable>
      </View>
      {mode === 'register' && (
        <>
          <Text style={styles.fieldHint}>
            {strings.auth.passwordHint}
          </Text>
          <Text style={styles.fieldLabel}>{strings.auth.emailOptionalLabel}</Text>
          <TextInput
            accessibilityLabel="Email (không bắt buộc)"
            placeholder={strings.auth.emailOptionalLabel}
            placeholderTextColor={colors.muted}
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
          <Text style={styles.fieldLabel}>{strings.auth.nameOptionalLabel}</Text>
          <TextInput
            accessibilityLabel="Tên hiển thị (không bắt buộc)"
            placeholder={strings.auth.nameOptionalLabel}
            placeholderTextColor={colors.muted}
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
            ? strings.auth.processing
            : mode === 'login'
            ? strings.auth.loginAction
            : strings.auth.registerAction
        }
        disabled={authBusy}
        onPress={() => submit()}
      />
      <View style={styles.authDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.fieldHint}>{strings.common.or}</Text>
        <View style={styles.dividerLine} />
      </View>
      <GoogleSigninButton
        accessibilityRole="button"
        accessibilityLabel={strings.auth.googleAction}
        accessibilityState={{ disabled: authBusy }}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Light}
        style={styles.googleButton}
        disabled={authBusy}
        onPress={() => {
          setError('');
          onGoogleAuth().catch(cause =>
            setError(errorMessage(cause, strings.auth.googleError)),
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
            ? strings.auth.noAccountSwitch
            : strings.auth.hasAccountSwitch}
        </Text>
      </Pressable>
      <View style={styles.authNotice}>
        <Settings2 size={19} color={colors.primaryText} />
        <Text style={styles.authNoticeText}>
          {strings.auth.guestNotice}
        </Text>
      </View>
    </>
  );
}
