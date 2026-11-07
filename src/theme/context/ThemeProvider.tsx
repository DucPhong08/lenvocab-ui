import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createTheme,
  defaultTheme,
  type Theme,
  type ThemeOptions,
} from '../theme';

function missingProvider() {
  throw new Error('ThemeProvider is required to update the theme.');
}

type Value = Theme & {
  setTheme: (options: ThemeOptions) => void;
  resetTheme: () => void;
};

const ThemeContext = createContext<Value>({
  ...defaultTheme,
  setTheme: missingProvider,
  resetTheme: missingProvider,
});

export function ThemeProvider({
  children,
  initialOptions = {},
}: {
  children: ReactNode;
  initialOptions?: ThemeOptions;
}) {
  const [options, setOptions] = useState(initialOptions);
  const setTheme = useCallback(
    (next: ThemeOptions) => setOptions(previous => ({ ...previous, ...next })),
    [],
  );
  const resetTheme = useCallback(() => setOptions({}), []);
  const value = useMemo(
    () => ({ ...createTheme(options), setTheme, resetTheme }),
    [options, setTheme, resetTheme],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
