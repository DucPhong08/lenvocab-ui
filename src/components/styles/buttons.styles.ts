import { createStyles } from '@/theme/styles';

export const useStyles = createStyles(({ colors, font }) => ({
  primaryButton: {
    minHeight: 54,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 17,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryButton: { backgroundColor: colors.primaryTint },
  primaryButtonText: {
    flexShrink: 1,
    textAlign: 'center',
    ...font.label,

    color: colors.onPrimary,
  },
  secondaryButtonText: { color: colors.primaryText },
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
}));
