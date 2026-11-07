import vocabulary from '../../assets/data/vocab-core.json';
import topics from '../../assets/data/topics.json';
import type { Scene, Word } from './types';
export type { Scene, Word } from './types';

export const allWords: Word[] = vocabulary.words;
export const scenes: Scene[] = topics.map(topic => ({
  ...topic,
  words: allWords.filter(word => word.scene === topic.id),
}));
