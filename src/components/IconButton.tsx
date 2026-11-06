import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { useStyles } from './styles/buttons.styles';

export function IconButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon: ReactNode;
}) {
  const { styles } = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      {icon}
    </Pressable>
  );
}
