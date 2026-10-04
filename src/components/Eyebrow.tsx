import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { styles } from './styles/branding.styles';
import { colors } from '@/theme/theme';

export function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <Text style={[styles.eyebrow, light && { color: colors.lime }]}>
      {children}
    </Text>
  );
}

