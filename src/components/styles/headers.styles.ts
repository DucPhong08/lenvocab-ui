import { StyleSheet } from 'react-native';
import { colors } from '@/theme/theme';

export const styles = StyleSheet.create({
  fill: { flex: 1 },
  titleBlock: { gap: 9, marginBottom: 25 },
  screenTitle: {
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '800',
    letterSpacing: -1.2,
    color: colors.ink,
  },
  subtitle: { fontSize: 15, lineHeight: 23, color: colors.muted },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  topBarTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  topBarEnd: { width: 44, alignItems: 'flex-end' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.6,
    marginTop: 5,
  },
  sectionAction: {
    minHeight: 44,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  sectionActionText: { fontSize: 13, fontWeight: '700', color: colors.forest },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});

