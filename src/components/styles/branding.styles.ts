import { createStyles } from '@/theme/styles';

export const useStyles = createStyles(({ colors, font }) => ({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.primaryTint,
    transform: [{ rotate: '-7deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: font.size.brand,
    ...font.display,
    color: colors.primaryText,
    letterSpacing: -1,
  },
  eyebrow: {
    fontSize: font.size.caption,
    fontWeight: font.weight.heavy,
    letterSpacing: 0.3,
    color: colors.muted,
    textTransform: 'none',
    lineHeight: font.line.caption,
  },
}));
