import { Pressable, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { Eyebrow } from './Eyebrow';
import { useStyles } from './styles/headers.styles';

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
  const { styles, colors } = useStyles();
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
          <ArrowRight size={15} color={colors.primaryText} />
        </Pressable>
      )}
    </View>
  );
}
