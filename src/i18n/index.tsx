import {
  createContext,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { vi, type Translations } from './vi';
import { en } from './en';
import { loadLocale, saveLocale } from './storage';

export type Language = 'vi' | 'en';

export { vi, en };
export type { Translations };

const dictionaries: Record<Language, Translations> = { vi, en };

let currentLanguage: Language = 'vi';
const listeners = new Set<(lang: Language) => void>();

export const getLocale = (): Language => currentLanguage;

export const setLocale = (lang: Language) => {
  currentLanguage = lang;
  listeners.forEach(fn => fn(lang));
};

export function t(
  path: string,
  params?: Record<string, string | number>,
  locale: Language = currentLanguage,
): string {
  const parts = path.split('.');
  let curr: any = dictionaries[locale] ?? dictionaries.vi;
  for (const part of parts) {
    if (curr == null) break;
    curr = curr[part];
  }
  if (typeof curr === 'function') {
    return curr(params?.count ?? 0);
  }
  if (typeof curr === 'string') {
    if (!params) return curr;
    return Object.entries(params).reduce(
      (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
      curr,
    );
  }
  return path;
}

export type I18nContextType = {
  locale: Language;
  setLocale: (lang: Language) => void;
  strings: Translations;
  t: (path: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType>({
  locale: 'vi',
  setLocale: () => {},
  strings: vi,
  t: (path, params) => t(path, params, 'vi'),
});

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Language;
}) {
  const [locale, setLocaleState] = useState<Language>(initialLocale ?? 'vi');
  const changes = useRef(0);

  useEffect(() => {
    setLocale(initialLocale ?? 'vi');
    if (initialLocale !== undefined) return;
    let active = true;
    const version = changes.current;
    loadLocale().then(next => {
      if (!active || changes.current !== version || !next) return;
      setLocaleState(next);
      setLocale(next);
    });
    return () => { active = false; };
  }, [initialLocale]);

  const changeLocale = useCallback((next: Language) => {
    changes.current += 1;
    setLocaleState(next);
    setLocale(next);
    saveLocale(next);
  }, []);

  const value = useMemo<I18nContextType>(() => {
    const strings = dictionaries[locale] ?? dictionaries.vi;
    return {
      locale,
      setLocale: changeLocale,
      strings,
      t: (path: string, params?: Record<string, string | number>) =>
        t(path, params, locale),
    };
  }, [locale, changeLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
