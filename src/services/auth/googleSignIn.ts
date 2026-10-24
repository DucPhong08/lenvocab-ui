import { Platform } from 'react-native';
import { GOOGLE_AUTH_CONFIG } from './googleConfig';

export async function googleIdToken(): Promise<string | null> {
  if (
    !GOOGLE_AUTH_CONFIG.webClientId ||
    (Platform.OS === 'ios' && !GOOGLE_AUTH_CONFIG.iosClientId)
  ) {
    throw new Error(
      'Đăng nhập Google chưa được thiết lập. Bạn có thể dùng username và mật khẩu.',
    );
  }
  // Load the native SDK only when the configured Google action is requested.
  const {
    GoogleSignin,
    isSuccessResponse,
    isErrorWithCode,
    statusCodes,
  }: typeof import('@react-native-google-signin/google-signin') = require('@react-native-google-signin/google-signin');
  GoogleSignin.configure({
    webClientId: GOOGLE_AUTH_CONFIG.webClientId,
    ...(GOOGLE_AUTH_CONFIG.iosClientId
      ? { iosClientId: GOOGLE_AUTH_CONFIG.iosClientId }
      : {}),
    offlineAccess: false,
  });
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await GoogleSignin.signIn();
    if (!isSuccessResponse(result)) return null;
    if (!result.data.idToken)
      throw new Error(
        'Google không trả về thông tin đăng nhập. Vui lòng thử lại.',
      );
    return result.data.idToken;
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) return null;
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE)
        throw new Error(
          'Thiết bị cần Google Play Services để đăng nhập Google.',
        );
      throw new Error(
        'Chưa thể đăng nhập Google. Vui lòng thử lại hoặc dùng username.',
      );
    }
    throw error;
  } finally {
    // The app persists only its own session. Show the account picker on the next attempt.
    await GoogleSignin.signOut().catch(() => {});
  }
}
