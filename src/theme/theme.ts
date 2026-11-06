import { createColors } from './palette';
import { createTypography } from './typography';

export type ThemeOptions = { primary?: string; fontScale?: number };

export function createTheme({ primary, fontScale }: ThemeOptions = {}) {
  return { colors: createColors(primary), font: createTypography(fontScale) };
}

export const defaultTheme = createTheme();
export type Theme = ReturnType<typeof createTheme>;

export const layout = {
  page: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
} as const;
