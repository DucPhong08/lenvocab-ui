import { StyleSheet } from 'react-native';
import { colors } from '@/theme/theme';

export const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: colors.muted,
    textTransform: 'uppercase',
    lineHeight: 18,
  },
});
