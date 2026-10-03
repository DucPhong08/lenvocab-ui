import { allWords } from './scenes';

export const getWord = (id: string) =>
  allWords.find(word => word.id === id) ?? allWords[0];
