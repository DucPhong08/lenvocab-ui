import { getLocale, type Language, t } from '@/i18n';
import { scenes } from './scenes';
import type { Scene } from './types';

export const getScene = (id: string, locale: Language = getLocale()): Scene => {
  const baseScene = scenes.find(scene => scene.id === id) ?? scenes[0];
  const titleKey = `scenes.${baseScene.id}.title`;
  const subtitleKey = `scenes.${baseScene.id}.subtitle`;
  const categoryKey = `scenes.${baseScene.id}.category`;

  const title = t(titleKey, undefined, locale);
  const subtitle = t(subtitleKey, undefined, locale);
  const category = t(categoryKey, undefined, locale);

  return {
    ...baseScene,
    title: title !== titleKey ? title : baseScene.title,
    subtitle: subtitle !== subtitleKey ? subtitle : baseScene.subtitle,
    category: category !== categoryKey ? category : baseScene.category,
  };
};
