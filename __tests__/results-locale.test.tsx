import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ResultsScreen } from '@/screens/discover/ResultsScreen';
import { I18nProvider } from '@/i18n';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { ScreenProps } from '@/types/screen';
import type { Word } from '@/data/scenes';

jest.mock('react-native-fs');
jest.mock('@react-native-community/image-editor', () => ({ cropImage: jest.fn() }));
jest.mock('lucide-react-native');
jest.mock('@/components/WordRow', () => ({ WordRow: () => null }));

const props = {
  navigate: jest.fn(),
  startPractice: jest.fn(),
  sceneId: 'desk',
  imageUri: null,
  scanResult: null,
  saved: [],
  cards: [],
  user: null,
  saving: false,
} as unknown as ScreenProps;

test('English results localizes filters and practice while keeping the selected level and ten-word round', async () => {
  let renderer!: Renderer.ReactTestRenderer;
  await act(async () => {
    renderer = Renderer.create(
      <I18nProvider initialLocale="en">
        <ResultsScreen {...props} />
      </I18nProvider>,
    );
  });
  try {
    expect(JSON.stringify(renderer.toJSON())).toContain('WORDS IN SAMPLE SCENE');
    expect(JSON.stringify(renderer.toJSON())).toContain('All levels');
    expect(JSON.stringify(renderer.toJSON())).not.toContain('Cấp độ của nội dung mẫu');
    const b2 = renderer.root.findAll(
      node => node.props.accessibilityLabel === 'Filter sample words: B2',
    )[0];
    expect(b2).toBeDefined();
    await act(async () => b2.props.onPress());
    expect(JSON.stringify(renderer.toJSON())).toContain('B2: focus on collocations and use in sentences.');
    const practice = renderer.root.findAllByType(PrimaryButton).find(
      node => node.props.label === 'Practice 10 B2 words',
    )!;
    expect(practice).toBeDefined();
    await act(async () => practice.props.onPress());
    const words = jest.mocked(props.startPractice).mock.calls[0][0] as Word[];
    expect(words.slice(0, 10)).toHaveLength(10);
    expect(words.every(word => word.level === 'B2')).toBe(true);
    expect(words[0].scene).toBe('desk');
    expect(renderer.root.findAllByType(PrimaryButton).some(
      node => node.props.label === 'Choose a real photo to create a card',
    )).toBe(true);
  } finally {
    await act(async () => renderer.unmount());
  }
});
