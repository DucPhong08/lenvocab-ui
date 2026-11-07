import { StyleSheet } from 'react-native';
import { useTheme } from './context/ThemeProvider';
import type { Theme } from './theme';

type Styles = Parameters<typeof StyleSheet.create>[0];

export function createStyles<const T extends Styles>(
  create: (theme: Theme) => T,
) {
  const cache = new WeakMap<Theme, Theme & { styles: Readonly<T> }>();
  return function useStyles() {
    const theme = useTheme();
    let base = cache.get(theme);
    if (!base) {
      base = { ...theme, styles: StyleSheet.create(create(theme)) };
      cache.set(theme, base);
    }
    return base;
  };
}
