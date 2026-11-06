import { ActivityIndicator, Text, View } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { PrimaryButton } from './PrimaryButton';
import { useStyles } from './styles/content.styles';

export function EmptyState({
  title,
  description,
  onPress,
  action,
  loading = false,
}: {
  title: string;
  description: string;
  onPress?: () => void;
  action?: string;
  loading?: boolean;
}) {
  const { styles, colors } = useStyles();
  return (
    <View accessibilityState={{ busy: loading }} style={styles.empty}>
      <View style={styles.emptyIcon}>
        {loading ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <BookOpen size={28} color={colors.primaryText} />
        )}
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
