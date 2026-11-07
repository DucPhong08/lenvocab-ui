import { createStyles } from '@/theme/styles';

export const useStyles = createStyles(({ colors, font }) => ({
  primaryButton: {
    minHeight: 54,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 17,
    backgroundColor: colors.primary,
    borderBottomWidth: 4,
    borderBottomColor: colors.primaryEdge,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: colors.primaryTint,
    borderBottomColor: colors.line,
  },
  primaryButtonText: {
    flexShrink: 1,
    textAlign: 'center',
    ...font.label,

    color: colors.onPrimary,
  },
  secondaryButtonText: { color: colors.primaryText },
  disabled: { opacity: 0.45 },
  pressed: { transform: [{ translateY: 2 }], borderBottomWidth: 2 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
