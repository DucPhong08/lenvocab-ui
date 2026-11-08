import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { AuthScreen } from '@/screens/account/AuthScreen';
import type { ScreenProps } from '@/types/screen';

jest.mock('lucide-react-native');

test('Google button retains error feedback and follows the shared authentication busy state', async () => {
  const onGoogleAuth = jest.fn().mockRejectedValue(new Error('Google chưa được cấu hình'));
  const props = {
    navigate: jest.fn(), onAuth: jest.fn(), onGoogleAuth,
    authBusy: false, scrollToTop: jest.fn(),
  } as unknown as ScreenProps;
  let view!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { view = ReactTestRenderer.create(<AuthScreen {...props} />); });
  try {
    const button = () => view.root.findByType(GoogleSigninButton);
    expect(button().props.accessibilityLabel).toBe('Tiếp tục với Google');
    await act(async () => { button().props.onPress(); });
    expect(onGoogleAuth).toHaveBeenCalledTimes(1);
    expect(view.root.findAllByType(Text).some(node => node.props.children === 'Google chưa được cấu hình')).toBe(true);
    await act(async () => { view.update(<AuthScreen {...props} authBusy />); });
    expect(button().props.disabled).toBe(true);
    expect(button().props.accessibilityState.disabled).toBe(true);
  } finally {
    await act(async () => view.unmount());
  }
});
