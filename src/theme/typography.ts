const size = {
  badge: 11,
  caption: 12,
  small: 13,
  body: 14,
  label: 15,
  subtitle: 16,
  reading: 17,
  avatar: 18,
  emptyTitle: 19,
  brand: 21,
  section: 22,
  profileAvatar: 23,
  meaning: 26,
  heading: 28,
  question: 30,
  onboarding: 31,
  screen: 32,
  auth: 33,
  flashcard: 35,
  word: 36,
  initial: 44,
};

const line = {
  caption: 18,
  hint: 19,
  small: 20,
  body: 21,
  subtitle: 23,
  description: 24,
  example: 25,
  reading: 26,
  section: 28,
  onboarding: 38,
  screen: 39,
  auth: 41,
  flashcard: 43,
};

function scale<T extends Record<string, number>>(values: T, factor: number) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value * factor]),
  ) as { [K in keyof T]: number };
}

export function createTypography(value = 1) {
  const factor = Number.isFinite(value) && value > 0 ? value : 1;
  const sizes = scale(size, factor);
  const heights = scale(line, factor);
  const weight = { bold: '700', heavy: '800' } as const;
  return {
    size: sizes,
    line: heights,
    weight,
    badge: { fontSize: sizes.badge, fontWeight: weight.heavy },
    action: { fontSize: sizes.small, fontWeight: weight.bold },
    label: { fontSize: sizes.label, fontWeight: weight.heavy },
    title: { fontSize: sizes.subtitle, fontWeight: weight.heavy },
    heading: { fontSize: sizes.heading, fontWeight: weight.heavy },
    body: { fontSize: sizes.body, lineHeight: heights.body },
    note: { fontSize: sizes.caption, lineHeight: heights.caption },
    description: { fontSize: sizes.small, lineHeight: heights.small },
    captionStrong: { fontSize: sizes.caption, fontWeight: weight.bold },
    bodyStrong: { fontSize: sizes.body, fontWeight: weight.bold },
    captionHeavy: { fontSize: sizes.caption, fontWeight: weight.heavy },
  };
}
