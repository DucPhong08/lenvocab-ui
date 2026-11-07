import { allWords, type Word } from '@/data/scenes';
import { SESSION_SIZE } from '@/data/study';

export function normalize(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('vi')
    .replace(/\s+/gu, ' ')
    .trim();
}

function meaningKey(value: string) {
  return normalize(value)
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function uniqueWords(words: Word[]) {
  const terms = new Set<string>();
  const ids = new Set<string>();
  return words.filter(word => {
    const term = normalize(word.term);
    if (
      !term ||
      !meaningKey(word.meaning) ||
      terms.has(term) ||
      ids.has(word.id)
    )
      return false;
    terms.add(term);
    ids.add(word.id);
    return true;
  });
}

function optionsFor(word: Word, pool: Word[]) {
  const meanings = new Set<string>();
  const options: Word[] = [];
  for (const item of uniqueWords([word, ...pool, ...allWords])) {
    const labels = item.meaning.split(/[,;/]/).map(meaningKey).filter(Boolean);
    if (!labels.length || labels.some(label => meanings.has(label))) continue;
    options.push(item);
    labels.forEach(label => meanings.add(label));
    if (options.length === 4) break;
  }
  for (let index = options.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [options[index], options[target]] = [options[target], options[index]];
  }
  return options;
}

function contextFor(words: Word[]) {
  for (const word of words) {
    const term = word.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      `(^|[^\\p{L}\\p{N}])${term}(?=$|[^\\p{L}\\p{N}])`,
      'giu',
    );
    for (const example of [word.example, word.example2]) {
      if (!example || [...example.matchAll(pattern)].length !== 1) continue;
      return { word, example, sentence: example.replace(pattern, '$1____') };
    }
  }
}

export function createQuiz(words: Word[]) {
  const pool = uniqueWords(words);
  const questions = pool.slice(0, SESSION_SIZE);
  return {
    questions,
    optionSets: questions.map(word => optionsFor(word, pool)),
    context: contextFor(questions),
    remaining: pool.slice(SESSION_SIZE),
  };
}
