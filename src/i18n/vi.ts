import viJson from '../../assets/locales/vi.json';
import { createTranslations } from './translations';

export const vi = createTranslations(viJson);
export type Translations = typeof vi;
