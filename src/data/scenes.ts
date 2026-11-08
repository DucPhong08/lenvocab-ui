import vocabulary from '../../assets/data/vocab-core.json';
import topics from '../../assets/data/topics.json';
import { getLocale, type Language, t } from '@/i18n';
import type { Scene, Word } from './types';
export type { Scene, Word } from './types';

export const allWords: Word[] = vocabulary.words;

export function getScenes(locale: Language = getLocale()): Scene[] {
  return topics.map(topic => {
    const titleKey = `scenes.${topic.id}.title`;
    const subtitleKey = `scenes.${topic.id}.subtitle`;
    const categoryKey = `scenes.${topic.id}.category`;

    const title = t(titleKey, undefined, locale);
    const subtitle = t(subtitleKey, undefined, locale);
    const category = t(categoryKey, undefined, locale);

    return {
      ...topic,
      title: title !== titleKey ? title : topic.title,
      subtitle: subtitle !== subtitleKey ? subtitle : topic.subtitle,
      category: category !== categoryKey ? category : topic.category,
      words: allWords.filter(word => word.scene === topic.id),
    };
  });
}

export const scenes: Scene[] = getScenes('vi');
