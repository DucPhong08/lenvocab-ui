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
  iconPosition = 'right',
  disabled = false,
  style,
  textStyle,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const { styles, colors } = useStyles();
  const renderIcon =
    icon ??
    (iconPosition === 'right' ? (
      <ArrowRight
        size={19}
        color={variant === 'primary' ? colors.onPrimary : colors.primaryText}
      />
    ) : null);

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
      {iconPosition === 'left' && renderIcon}
      <Text
        style={[
          styles.primaryButtonText,
          variant === 'secondary' && styles.secondaryButtonText,
          textStyle,
        ]}
      >
        {label}
      </Text>
      {iconPosition === 'right' && renderIcon}
    </Pressable>
  );
}
