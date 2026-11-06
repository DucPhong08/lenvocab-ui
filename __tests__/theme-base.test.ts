import { createTheme } from '@/theme/theme';

test('default theme preserves the current colors and text sizes', () => {
  const { colors, font } = createTheme();
  expect(colors).toMatchObject({
    background: '#FAF7F2',
    primary: '#9A4A27',
    primaryTint: '#F9E8DD',
    highlight: '#F3D58C',
    onPrimary: '#FFFFFF',
  });
  expect(font.size.body).toBe(14);
  expect(font.line.body).toBe(21);
});

test.each([
  ['#FFFFFF', '#000000'],
  ['#000000', '#FFFFFF'],
  ['#123456', '#FFFFFF'],
  ['#FFF59D', '#000000'],
  ['#777777', '#000000'],
])('chooses readable button text for %s', (primary, onPrimary) => {
  const { colors } = createTheme({ primary });
  expect(colors.primary).toBe(primary);
  expect(colors.onPrimary).toBe(onPrimary);
  expect(colors.onOverlay).toBe('#FFFFFF');
  expect(colors.success).toBe('#2D754F');
});

test('light accents still have readable labels on light surfaces', () => {
  const { colors } = createTheme({ primary: '#FFFFFF' });
  expect(colors.primaryText).not.toBe(colors.primary);
  expect(colors.primaryTint).toBe('#FFFFFF');
});

test('supports short hex and falls back safely for invalid colors', () => {
  expect(createTheme({ primary: '#abc' }).colors.primary).toBe('#AABBCC');
  expect(createTheme({ primary: 'red' }).colors.primary).toBe('#9A4A27');
  expect(createTheme({ primary: '#12345' }).colors.primary).toBe('#9A4A27');
});

test('scales sizes and line spacing together without scaling font weight', () => {
  const { font } = createTheme({ fontScale: 1.2 });
  expect(font.size.body).toBeCloseTo(16.8);
  expect(font.line.body).toBeCloseTo(25.2);
  expect(font.weight.heavy).toBe('800');
  expect(createTheme({ fontScale: 0 }).font.size.body).toBe(14);
  expect(createTheme({ fontScale: NaN }).font.size.body).toBe(14);
});
