import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '@/theme/theme';
import { styles } from '../styles';

export function MenuItem({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.menuIcon}>{icon}</View>
      <Text style={[styles.menuText, styles.fill]}>{label}</Text>
      <ChevronRight size={18} color={colors.subtle} />
    </Pressable>
  );
}
