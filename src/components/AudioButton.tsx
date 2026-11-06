import { Pressable, StyleSheet } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import { colors } from '@/theme/theme';

export function AudioButton({
  label,
  onPress,
  playing = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
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
        (pressed || playing || disabled) && styles.pressed,
      ]}
    >
      <Volume2 size={20} color={colors.primary} />
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
    backgroundColor: colors.primaryTint,
  },
  pressed: { opacity: 0.65 },
});
