import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { IconButton } from './IconButton';
import { styles } from './styles/headers.styles';
import { colors } from '@/theme/theme';

export function TopBar({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack: () => void;
  action?: ReactNode;
}) {
  return (
    <View style={styles.topBar}>
      <IconButton
        label="Quay lại"
        onPress={onBack}
        icon={<ArrowLeft size={21} color={colors.ink} />}
      />
      <Text style={styles.topBarTitle}>{title}</Text>
      <View style={styles.topBarEnd}>{action}</View>
    </View>
  );
}

