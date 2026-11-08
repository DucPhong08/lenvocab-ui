import { View, type ViewProps } from 'react-native';

// Native button rendering is checked in the Android build; Jest exercises the handler.
export function GoogleSigninButton(props: ViewProps & { disabled?: boolean }) {
  return <View {...props} />;
}
GoogleSigninButton.Size = { Wide: 1 };
GoogleSigninButton.Color = { Light: 'light' };
