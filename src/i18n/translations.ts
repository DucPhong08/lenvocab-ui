import type viJson from '../../assets/locales/vi.json';

export const formatMessage = (
  template: string,
  params: Record<string, string | number> | number | string,
) => {
  if (typeof params === 'number' || typeof params === 'string') {
    return template.replace(/\{[a-zA-Z0-9_]+\}/, String(params));
  }
  return Object.entries(params).reduce(
    (message, [key, value]) =>
      message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    template,
  );
};

const withCount = (template: string) => (count: number) =>
  formatMessage(template, count);

export const createTranslations = (data: typeof viJson) => ({
  ...data,
  library: {
    ...data.library,
    samples: withCount(data.library.samples),
  },
  review: {
    ...data.review,
    start: withCount(data.review.start),
    hint: withCount(data.review.hint),
    roundCount: withCount(data.review.roundCount),
    waitingDueHint: withCount(data.review.waitingDueHint),
  },
  offline: {
    ...data.offline,
    cached: withCount(data.offline.cached),
    pending: withCount(data.offline.pending),
    rejected: withCount(data.offline.rejected),
  },
  home: {
    ...data.home,
    dueLabel: withCount(data.home.dueLabel),
    sessionDescription: withCount(data.home.sessionDescription),
    startDue: withCount(data.home.startDue),
  },
  flashcards: {
    ...data.flashcards,
    wordNumber: (index: number) =>
      formatMessage(data.flashcards.wordNumber, { index }),
    reviewedCount: withCount(data.flashcards.reviewedCount),
    remainingDue: withCount(data.flashcards.remainingDue),
    reviewMore: withCount(data.flashcards.reviewMore),
  },
  quiz: {
    ...data.quiz,
    missedDescription: withCount(data.quiz.missedDescription),
    practiceMore: withCount(data.quiz.practiceMore),
    chooseSubtitle: withCount(data.quiz.chooseSubtitle),
    contextHint: (meaning: string) =>
      formatMessage(data.quiz.contextHint, { meaning }),
  },
  history: {
    ...data.history,
    countText: withCount(data.history.countText),
    scannedKeyword: (keyword: string) =>
      formatMessage(data.history.scannedKeyword, { keyword }),
    sampleCategory: (count: number, category: string) =>
      formatMessage(data.history.sampleCategory, { count, category }),
  },
  saved: {
    ...data.saved,
    countText: withCount(data.saved.countText),
    matchingLoaded: withCount(data.saved.matchingLoaded),
    matchingCount: withCount(data.saved.matchingCount),
    loadedProgress: (loaded: number, total: number) =>
      formatMessage(data.saved.loadedProgress, { loaded, total }),
  },
  results: {
    ...data.results,
    wordsToExplore: withCount(data.results.wordsToExplore),
    mainWordNotice: (keyword: string) =>
      formatMessage(data.results.mainWordNotice, { keyword }),
    savedStickerLabel: (term: string) =>
      formatMessage(data.results.savedStickerLabel, { term }),
    sampleCount: withCount(data.results.sampleCount),
    filterLevel: (level: string) =>
      formatMessage(data.results.filterLevel, { level }),
    extraSceneWordsAtLevel: (level: string) =>
      formatMessage(data.results.extraSceneWordsAtLevel, { level }),
    practiceAllWords: withCount(data.results.practiceAllWords),
    practiceLevelWords: (count: number, level: string) =>
      formatMessage(data.results.practiceLevelWords, { count, level }),
  },
  word: {
    ...data.word,
    openLabel: (term: string, meaning: string) =>
      formatMessage(data.word.openLabel, { term, meaning }),
    photoLabel: (term: string) => formatMessage(data.word.photoLabel, { term }),
    listenLabel: (term: string) =>
      formatMessage(data.word.listenLabel, { term }),
    savedLabel: (term: string) => formatMessage(data.word.savedLabel, { term }),
    saveLabel: (term: string) => formatMessage(data.word.saveLabel, { term }),
  },
});
