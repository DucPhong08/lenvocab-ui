import type { ReactNode } from 'react';
import {
  Pressable,
  Text,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useStyles } from './styles/buttons.styles';

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
  textStyle,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const { styles, colors } = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
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
          textStyle,
        ]}
      >
        {label}
      </Text>
      {icon ?? (
        <ArrowRight
          size={19}
          color={variant === 'primary' ? colors.onPrimary : colors.primaryText}
        />
      )}
    </Pressable>
  );
}
