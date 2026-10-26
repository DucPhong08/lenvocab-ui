import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/theme';

export function StudyProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
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

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 6,
    backgroundColor: colors.line,
    overflow: 'hidden',
    marginBottom: 20,
  },
  fill: { height: '100%', backgroundColor: colors.success, borderRadius: 6 },
});
