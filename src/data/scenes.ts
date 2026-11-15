import vocabulary from '../../assets/data/vocab-core.json';
import sampleAudio from '../../assets/data/vocab-audio.json';
import topics from '../../assets/data/topics.json';
import { getLocale, type Language, t } from '@/i18n';
import type { Scene, Word } from './types';
export type { Scene, Word } from './types';

const audioById: Record<string, string> = sampleAudio;

export const allWords: Word[] = vocabulary.words.map(word => ({
  ...word,
  audio: audioById[word.id] ?? null,
}));

export function localizeScene(scene: Scene, locale: Language): Scene {
  function label(field: 'title' | 'subtitle' | 'category') {
    const key = `scenes.${scene.id}.${field}`;
    const value = t(key, undefined, locale);
    return value === key ? scene[field] : value;
  }
  return {
    ...scene,
    title: label('title'),
    subtitle: label('subtitle'),
    category: label('category'),
  };
}

export function getScenes(locale: Language = getLocale()): Scene[] {
  return topics.map(topic =>
    localizeScene(
      { ...topic, words: allWords.filter(word => word.scene === topic.id) },
      locale,
    ),
  );
}

export const scenes: Scene[] = getScenes('vi');
