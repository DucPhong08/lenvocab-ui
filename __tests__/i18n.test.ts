import { vi, en, t, setLocale, getLocale } from '../src/i18n';
import { getScene } from '../src/data/getScene';
import { getScenes } from '../src/data/scenes';

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

  test('vi and en dictionaries have parity across all keys', () => {
    const viData = require('../assets/locales/vi.json');
    const enData = require('../assets/locales/en.json');

    const checkKeys = (viObj: any, enObj: any, prefix = '') => {
      Object.keys(viObj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        expect(enObj).toHaveProperty(key);
        if (typeof viObj[key] === 'object' && viObj[key] !== null) {
          checkKeys(viObj[key], enObj[key], fullKey);
        }
      });
    };

    checkKeys(viData, enData);
    checkKeys(enData, viData);
  });

  test('localizes scenes via getScene and getScenes', () => {
    setLocale('vi');
    const viScene = getScene('desk');
    expect(viScene.title).toBe('Góc học tập');
    expect(viScene.category).toBe('Không gian sống');

    setLocale('en');
    const enScene = getScene('desk');
    expect(enScene.title).toBe('Study Desk');
    expect(enScene.category).toBe('Living Space');

    const enScenes = getScenes('en');
    expect(enScenes).toHaveLength(10);
    expect(enScenes.find(s => s.id === 'kitchen')?.title).toBe('In the Kitchen');
  });
});
