import { vi, en, t, setLocale, getLocale } from '../src/i18n';

describe('i18n localization system', () => {
  beforeEach(() => {
    setLocale('vi');
  });

  test('vi dictionary loads correctly from assets/locales/vi.json', () => {
    expect(vi.nav.home).toBe('Trang chủ');
    expect(vi.common.back).toBe('Quay lại');
    expect(vi.library.samples(10)).toBe('10 từ và cụm mẫu · không cần mạng');
    expect(vi.offline.cached(5)).toBe('5 thẻ đã tải về máy');
  });

  test('en dictionary loads correctly from assets/locales/en.json', () => {
    expect(en.nav.home).toBe('Home');
    expect(en.common.back).toBe('Back');
    expect(en.library.samples(10)).toBe('10 sample words & phrases · offline');
    expect(en.offline.cached(5)).toBe('5 cards downloaded to device');
  });

  test('t() helper resolves nested keys and formats params', () => {
    setLocale('vi');
    expect(t('common.cancel')).toBe('Hủy');
    expect(t('home.streakDays', { count: 7 })).toBe('7 ngày liên tục');

    setLocale('en');
    expect(t('common.cancel')).toBe('Cancel');
    expect(t('home.streakDays', { count: 7 })).toBe('7 day streak');
  });

  test('getLocale and setLocale manage active locale', () => {
    expect(getLocale()).toBe('vi');
    setLocale('en');
    expect(getLocale()).toBe('en');
  });

  test('fallback to key if translation missing', () => {
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });
});
