import { Pressable, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { Eyebrow } from './Eyebrow';
import { styles } from './styles/headers.styles';
import { colors } from '@/theme/theme';

export function SectionHeader({
  kicker,
  title,
  action,
  onAction,
}: {
  kicker?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.fill}>
        {kicker && <Eyebrow>{kicker}</Eyebrow>}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action && onAction && (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [
            styles.sectionAction,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.sectionActionText}>{action}</Text>
          <ArrowRight size={15} color={colors.forest} />
        </Pressable>
      )}
    </View>
  );
}

