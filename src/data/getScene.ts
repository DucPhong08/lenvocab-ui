import { getLocale, type Language } from '@/i18n';
import { localizeScene, scenes } from './scenes';
import type { Scene } from './types';

export const getScene = (id: string, locale: Language = getLocale()): Scene => {
  const scene = scenes.find(item => item.id === id) ?? scenes[0];
  return localizeScene(scene, locale);
};
