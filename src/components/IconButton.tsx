import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { styles } from './styles/buttons.styles';

export function IconButton({
  label,
  onPress,
  icon,
  light = false,
}: {
  label: string;
  onPress: () => void;
  icon: ReactNode;
  light?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        light && styles.lightIconButton,
        pressed && styles.pressed,
      ]}
    >
      {icon}
    </Pressable>
  );
}


