const base = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F1FC',
  text: '#29233D',
  muted: '#6B627B',
  line: '#E7E2F1',
  primary: '#6B46E5',
  primaryEdge: '#4B2BBA',
  onPrimary: '#FFFFFF',
  primaryText: '#5A35C5',
  primaryTint: '#EDE7FF',
  highlight: '#FFD96A',
  stickerTint: '#FFF1BC',
  accent: '#FF8C78',
  accentTint: '#FFF0E9',
  accentText: '#633B42',
  overlay: '#29233DE8',
  onOverlay: '#FFFFFF',
  selectionFill: '#FFD96A33',
  success: '#2D754F',
  successTint: '#E7F5E8',
  error: '#BB4C3B',
  errorTint: '#FFF1ED',
  warning: '#946132',
};

const rgb = (hex: string) =>
  [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const luminance = (hex: string) =>
  rgb(hex).reduce((sum, value, i) => {
    const channel = value / 255;
    return (
      sum +
      [0.2126, 0.7152, 0.0722][i] *
        (channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4)
    );
  }, 0);
const contrast = (a: string, b: string) => {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
};
const mix = (a: string, b: string, amount: number) => {
  const target = rgb(b);
  return (
    '#' +
    rgb(a)
      .map((value, i) =>
        Math.round(value + (target[i] - value) * amount)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
      .toUpperCase()
  );
};

export function createColors(value = base.primary) {
  if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) return { ...base };
  const primary = (
    value.length === 4
      ? '#' + [...value.slice(1)].map(c => c + c).join('')
      : value
  ).toUpperCase();
  if (primary === base.primary) return { ...base };
  const primaryTint = mix(primary, '#FFFFFF', 0.9);
  const highlight = mix(primary, '#FFFFFF', 0.7);
  const surfaces = [primaryTint, highlight, base.surfaceMuted, base.background];
  let primaryText = primary;
  for (
    let step = 1;
    step <= 10 && surfaces.some(color => contrast(primaryText, color) < 4.5);
    step++
  ) {
    primaryText = mix(primary, '#000000', step / 10);
  }
  return {
    ...base,
    primary,
    primaryEdge: mix(primary, '#000000', 0.25),
    primaryText,
    primaryTint,
    highlight,
    selectionFill: highlight + '33',
    onPrimary:
      contrast(primary, '#FFFFFF') >= contrast(primary, '#000000')
        ? '#FFFFFF'
        : '#000000',
  };
}
