import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { IconButton } from './IconButton';
import { useStyles } from './styles/headers.styles';

export function TopBar({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack: () => void;
  action?: ReactNode;
}) {
  const { styles, colors } = useStyles();
  return (
    <View style={styles.topBar}>
      <IconButton
        label="Quay lại"
        onPress={onBack}
        icon={<ArrowLeft size={21} color={colors.text} />}
      />
      <Text style={styles.topBarTitle}>{title}</Text>
      <View style={styles.topBarEnd}>{action}</View>
    </View>
  );
}
