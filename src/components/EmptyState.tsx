import { Text, View } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { PrimaryButton } from './PrimaryButton';
import { styles } from './content.styles';
import { colors } from '@/theme/theme';

export function EmptyState({
  title,
  description,
  onPress,
  action,
}: {
  title: string;
  description: string;
  onPress?: () => void;
  action?: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <BookOpen size={28} color={colors.forest} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {action && onPress && (
        <PrimaryButton
          label={action}
          onPress={onPress}
          variant="secondary"
          style={styles.emptyAction}
        />
      )}
    </View>
  );
}

