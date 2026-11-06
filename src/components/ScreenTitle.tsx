import { Text, View } from 'react-native';
import { Eyebrow } from './Eyebrow';
import { useStyles } from './styles/headers.styles';

export function ScreenTitle({
  kicker,
  title,
  subtitle,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
}) {
  const { styles } = useStyles();
  return (
    <View style={styles.titleBlock}>
      {kicker && <Eyebrow>{kicker}</Eyebrow>}
      <Text accessibilityRole="header" style={styles.screenTitle}>
        {title}
      </Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}
