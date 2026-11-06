import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { useStyles } from './styles/branding.styles';

export function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  const { styles, colors } = useStyles();
  return (
    <Text style={[styles.eyebrow, light && { color: colors.onOverlay }]}>
      {children}
    </Text>
  );
}
