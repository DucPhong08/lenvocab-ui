import type { ReactNode } from 'react';
import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { styles } from './styles/buttons.styles';
import { colors } from '@/theme/theme';

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.primaryButtonText,
          variant === 'secondary' && styles.secondaryButtonText,
        ]}
      >
        {label}
      </Text>
      {icon ?? (
        <ArrowRight
          size={19}
          color={variant === 'primary' ? colors.surface : colors.forest}
        />
      )}
    </Pressable>
  );
}

