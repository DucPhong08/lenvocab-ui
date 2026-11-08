import RNFS from 'react-native-fs';
import type { Language } from './index';

const path = `${RNFS.DocumentDirectoryPath}/lenvocab-locale.txt`;
let writes = Promise.resolve();

export async function loadLocale(): Promise<Language | null> {
  await writes;
  try {
    const value = await RNFS.readFile(path, 'utf8');
    return value === 'vi' || value === 'en' ? value : null;
  } catch {
    return null;
  }
}

export function saveLocale(locale: Language) {
  writes = writes
    .then(() => RNFS.writeFile(path, locale, 'utf8'))
    .catch(() => {});
  return writes;
}
