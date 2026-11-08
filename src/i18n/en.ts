import enJson from '../../assets/locales/en.json';
import type { Translations } from './vi';

const format = (template: string, params: Record<string, string | number> | number | string) => {
  if (typeof params === 'number' || typeof params === 'string') {
    return template.replace(/\{[a-zA-Z0-9_]+\}/, String(params));
  }
  return Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    template,
  );
};

export const en: Translations = {
  ...enJson,
  library: {
    ...enJson.library,
    samples: (count: number) => format(enJson.library.samples, count),
  },
  review: {
    ...enJson.review,
    start: (count: number) => format(enJson.review.start, count),
    hint: (count: number) => format(enJson.review.hint, count),
    roundCount: (count: number) => format(enJson.review.roundCount, count),
    waitingDueHint: (count: number) => format(enJson.review.waitingDueHint, count),
  },
  offline: {
    ...enJson.offline,
    cached: (count: number) => format(enJson.offline.cached, count),
    pending: (count: number) => format(enJson.offline.pending, count),
    rejected: (count: number) => format(enJson.offline.rejected, count),
  },
  home: {
    ...enJson.home,
    dueLabel: (count: number) => format(enJson.home.dueLabel, count),
    sessionDescription: (count: number) => format(enJson.home.sessionDescription, count),
    startDue: (count: number) => format(enJson.home.startDue, count),
  },
  flashcards: {
    ...enJson.flashcards,
    wordNumber: (index: number) => format(enJson.flashcards.wordNumber, { index }),
    reviewedCount: (count: number) => format(enJson.flashcards.reviewedCount, count),
    remainingDue: (count: number) => format(enJson.flashcards.remainingDue, count),
    reviewMore: (count: number) => format(enJson.flashcards.reviewMore, count),
  },
  quiz: {
    ...enJson.quiz,
    missedDescription: (count: number) => format(enJson.quiz.missedDescription, count),
    practiceMore: (count: number) => format(enJson.quiz.practiceMore, count),
    chooseSubtitle: (count: number) => format(enJson.quiz.chooseSubtitle, count),
    contextHint: (meaning: string) => format(enJson.quiz.contextHint, { meaning }),
  },
  history: {
    ...enJson.history,
    countText: (count: number) => format(enJson.history.countText, count),
    scannedKeyword: (keyword: string) => format(enJson.history.scannedKeyword, { keyword }),
    sampleCategory: (count: number, category: string) => format(enJson.history.sampleCategory, { count, category }),
  },
  saved: {
    ...enJson.saved,
    countText: (count: number) => format(enJson.saved.countText, count),
    matchingLoaded: (count: number) => format(enJson.saved.matchingLoaded, count),
    matchingCount: (count: number) => format(enJson.saved.matchingCount, count),
    loadedProgress: (loaded: number, total: number) => format(enJson.saved.loadedProgress, { loaded, total }),
  },
  results: {
    ...enJson.results,
    wordsToExplore: (count: number) => format(enJson.results.wordsToExplore, count),
    mainWordNotice: (keyword: string) => format(enJson.results.mainWordNotice, { keyword }),
    savedStickerLabel: (term: string) => format(enJson.results.savedStickerLabel, { term }),
    sampleCount: (count: number) => format(enJson.results.sampleCount, count),
    filterLevel: (level: string) => format(enJson.results.filterLevel, { level }),
    extraSceneWordsAtLevel: (level: string) => format(enJson.results.extraSceneWordsAtLevel, { level }),
    practiceAllWords: (count: number) => format(enJson.results.practiceAllWords, count),
    practiceLevelWords: (count: number, level: string) => format(enJson.results.practiceLevelWords, { count, level }),
  },
  word: {
    ...enJson.word,
    openLabel: (term: string, meaning: string) => format(enJson.word.openLabel, { term, meaning }),
    photoLabel: (term: string) => format(enJson.word.photoLabel, { term }),
    listenLabel: (term: string) => format(enJson.word.listenLabel, { term }),
    savedLabel: (term: string) => format(enJson.word.savedLabel, { term }),
    saveLabel: (term: string) => format(enJson.word.saveLabel, { term }),
  },
  notifications: enJson.notifications,
  scenes: enJson.scenes,
};
