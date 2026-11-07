import { createStyles } from '@/theme/styles';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

export function StudyCard({
  title,
  description,
  label = 'Lượt ôn của bạn',
  illustration,
  children,
}: {
  title: string;
  description: string;
  label?: string;
  illustration?: ReactNode;
  children: ReactNode;
}) {
  const { styles } = useStyles();
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        {illustration}
      </View>
      {children}
    </View>
  );
}
const useStyles = createStyles(({ colors, font }) => ({
  card: {
    backgroundColor: colors.primaryTint,
    borderRadius: 25,
    padding: 20,
    gap: 12,
    marginBottom: 16,
  },
  label: { ...font.captionStrong, color: colors.primaryText },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  copy: { flex: 1, gap: 10 },
  title: { ...font.heading, fontSize: font.size.section, color: colors.text },
  description: { ...font.description, color: colors.muted },
}));
