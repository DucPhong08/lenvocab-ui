import legacyIds from './fixtures/legacy-word-ids.json';
import { allWords, scenes } from '@/data/scenes';

test('the bundled dictionary contains 200 unique words across ten complete topics', () => {
  expect(allWords).toHaveLength(200);
  expect(scenes).toHaveLength(10);
  expect(new Set(allWords.map(word => word.id)).size).toBe(200);
  expect(new Set(allWords.map(word => word.term.toLowerCase())).size).toBe(200);
  for (const scene of scenes) expect(scene.words).toHaveLength(20);
});

test('every sample provides the fields needed to learn without an API', () => {
  for (const word of allWords) {
    for (const value of [
      word.term,
      word.meaning,
      word.ipa,
      word.type,
      word.example,
      word.translation,
      word.note,
    ]) {
      expect(typeof value).toBe('string');
      expect(value!.trim()).not.toBe('');
    }
    expect(word.ipa).toMatch(/^\/.+\/$/);
    expect(['A1', 'A2', 'B1', 'B2']).toContain(word.level);
    expect(scenes.some(scene => scene.id === word.scene)).toBe(true);
  }
});

test('existing saved sample links keep their original IDs', () => {
  expect(legacyIds.every(id => allWords.some(word => word.id === id))).toBe(
    true,
  );
});
