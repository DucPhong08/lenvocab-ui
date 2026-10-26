import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/theme';
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
  return (
    <View style={styles.card}>
      <Eyebrow light>MỘT LƯỢT NGẮN MỖI NGÀY</Eyebrow>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.forest,
    borderRadius: 24,
    padding: 20,
    gap: 12,
    marginBottom: 16,
  },
  title: { color: colors.surface, fontSize: 28, fontWeight: '800' },
  description: { color: '#D9EEE1', fontSize: 14, lineHeight: 21 },
});
