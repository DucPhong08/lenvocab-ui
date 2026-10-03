import { Text, View } from 'react-native';
import { Eyebrow } from './Eyebrow';
import { styles } from './headers.styles';

export function ScreenTitle({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.titleBlock}>
      <Eyebrow>{kicker}</Eyebrow>
      <Text style={styles.screenTitle}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}


