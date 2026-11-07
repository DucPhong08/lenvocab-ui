import { createStyles } from '@/theme/styles';

export const useStyles = createStyles(({ colors, font }) => ({
  fill: { flex: 1 },
  titleBlock: { gap: 8, marginBottom: 22 },
  screenTitle: {
    fontSize: font.size.screen,
    lineHeight: font.line.screen,
    ...font.display,
    letterSpacing: -1.2,
    color: colors.text,
  },
  subtitle: {
    fontSize: font.size.label,
    lineHeight: font.line.subtitle,
    color: colors.muted,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  topBarTitle: {
    flex: 1,
    ...font.title,

    color: colors.text,
  },
  topBarEnd: { minWidth: 44, alignItems: 'flex-end' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: font.size.section,
    lineHeight: font.line.section,
    ...font.display,
    color: colors.text,
    letterSpacing: -0.6,
    marginTop: 5,
  },
  sectionAction: {
    minHeight: 44,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  sectionActionText: {
    ...font.action,

    color: colors.primaryText,
  },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
}));
