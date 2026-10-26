import { Pressable, StyleSheet } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import { colors } from '@/theme/theme';

export function AudioButton({
  label,
  onPress,
  light = false,
  playing = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  light?: boolean;
  playing?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: playing, disabled }}
      disabled={disabled}
      onPress={event => {
        event.stopPropagation?.();
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        light && styles.light,
        (pressed || playing || disabled) && styles.pressed,
      ]}
    >
      <Volume2 size={20} color={light ? colors.lime : colors.forest} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pale,
  },
  light: { backgroundColor: '#FFFFFF22' },
  pressed: { opacity: 0.65 },
});
