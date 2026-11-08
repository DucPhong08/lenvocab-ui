import viJson from '../../assets/locales/vi.json';

const format = (template: string, params: Record<string, string | number> | number | string) => {
  if (typeof params === 'number' || typeof params === 'string') {
    return template.replace(/\{[a-zA-Z0-9_]+\}/, String(params));
  }
  return Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    template,
  );
};

export const vi = {
  ...viJson,
  library: {
    ...viJson.library,
    samples: (count: number) => format(viJson.library.samples, count),
  },
  review: {
    ...viJson.review,
    start: (count: number) => format(viJson.review.start, count),
    hint: (count: number) => format(viJson.review.hint, count),
    roundCount: (count: number) => format(viJson.review.roundCount, count),
    waitingDueHint: (count: number) => format(viJson.review.waitingDueHint, count),
  },
  offline: {
    ...viJson.offline,
    cached: (count: number) => format(viJson.offline.cached, count),
    pending: (count: number) => format(viJson.offline.pending, count),
    rejected: (count: number) => format(viJson.offline.rejected, count),
  },
  home: {
    ...viJson.home,
    dueLabel: (count: number) => format(viJson.home.dueLabel, count),
    sessionDescription: (count: number) => format(viJson.home.sessionDescription, count),
    startDue: (count: number) => format(viJson.home.startDue, count),
  },
  flashcards: {
    ...viJson.flashcards,
    wordNumber: (index: number) => format(viJson.flashcards.wordNumber, { index }),
    reviewedCount: (count: number) => format(viJson.flashcards.reviewedCount, count),
    remainingDue: (count: number) => format(viJson.flashcards.remainingDue, count),
    reviewMore: (count: number) => format(viJson.flashcards.reviewMore, count),
  },
  quiz: {
    ...viJson.quiz,
    missedDescription: (count: number) => format(viJson.quiz.missedDescription, count),
    practiceMore: (count: number) => format(viJson.quiz.practiceMore, count),
    chooseSubtitle: (count: number) => format(viJson.quiz.chooseSubtitle, count),
    contextHint: (meaning: string) => format(viJson.quiz.contextHint, { meaning }),
  },
  history: {
    ...viJson.history,
    countText: (count: number) => format(viJson.history.countText, count),
    scannedKeyword: (keyword: string) => format(viJson.history.scannedKeyword, { keyword }),
    sampleCategory: (count: number, category: string) => format(viJson.history.sampleCategory, { count, category }),
  },
  saved: {
    ...viJson.saved,
    countText: (count: number) => format(viJson.saved.countText, count),
    matchingLoaded: (count: number) => format(viJson.saved.matchingLoaded, count),
    matchingCount: (count: number) => format(viJson.saved.matchingCount, count),
    loadedProgress: (loaded: number, total: number) => format(viJson.saved.loadedProgress, { loaded, total }),
  },
  results: {
    ...viJson.results,
    wordsToExplore: (count: number) => format(viJson.results.wordsToExplore, count),
    mainWordNotice: (keyword: string) => format(viJson.results.mainWordNotice, { keyword }),
  },
  notifications: viJson.notifications,
  scenes: viJson.scenes,
};

export type Translations = typeof vi;
