import { createStyles } from '@/theme/styles';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Eyebrow } from './Eyebrow';

export function StudyCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { styles } = useStyles();
  return (
    <View style={styles.card}>
      <Eyebrow>MỘT LƯỢT NGẮN MỖI NGÀY</Eyebrow>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {children}
    </View>
  );
}
const useStyles = createStyles(({ colors, font }) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  title: {
    color: colors.text,
    ...font.heading,
  },
  description: {
    color: colors.muted,
    ...font.body,
  },
}));
