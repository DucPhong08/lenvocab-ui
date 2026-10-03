import { StyleSheet } from 'react-native';
import { colors } from '@/theme/theme';

export const styles = StyleSheet.create({
  primaryButton: {
    minHeight: 54,
    paddingHorizontal: 20,
    borderRadius: 17,
    backgroundColor: colors.forest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryButton: { backgroundColor: colors.pale },
  primaryButtonText: { fontSize: 15, fontWeight: '800', color: colors.surface },
  secondaryButtonText: { color: colors.forest },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightIconButton: { backgroundColor: '#FFFFFF22' },
});

