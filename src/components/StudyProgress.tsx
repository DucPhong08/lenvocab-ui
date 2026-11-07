import { createStyles } from '@/theme/styles';
import { View } from 'react-native';

export function StudyProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const { styles } = useStyles();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Tiến độ học"
      accessibilityValue={{ min: 0, max: total, now: current }}
      style={styles.track}
    >
      <View
        style={[
          styles.fill,
          { width: `${total ? (current / total) * 100 : 0}%` },
        ]}
      />
    </View>
  );
}

const useStyles = createStyles(({ colors }) => ({
  track: {
    height: 10,
    borderRadius: 6,
    backgroundColor: colors.line,
    overflow: 'hidden',
    marginBottom: 20,
  },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 6 },
}));
