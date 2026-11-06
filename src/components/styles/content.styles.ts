import { createStyles } from '@/theme/styles';

export const useStyles = createStyles(({ colors, font }) => ({
  fill: { flex: 1 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 17,
    marginBottom: 9,
    paddingLeft: 12,
    paddingRight: 5,
    borderWidth: 1,
    borderColor: colors.line,
  },
  wordMain: {
    flex: 1,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  wordInitial: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordInitialText: {
    fontSize: font.size.section,
    fontWeight: font.weight.heavy,
    color: colors.primaryText,
  },
  wordTerm: {
    ...font.title,

    color: colors.text,
  },
  wordMeaning: {
    fontSize: font.size.caption,
    color: colors.muted,
    marginTop: 3,
  },
  bookmark: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: font.size.emptyTitle,
    fontWeight: font.weight.heavy,
    textAlign: 'center',
  },
  emptyDescription: {
    ...font.body,

    textAlign: 'center',
    color: colors.muted,
  },
  emptyAction: { alignSelf: 'stretch', marginTop: 8 },
}));
