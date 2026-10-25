import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { SavedScreen } from '@/screens/learn/SavedScreen';
import type { ScreenProps } from '@/types/screen';
import type { Flashcard } from '@/api/contracts';

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  const mockReact = require('react');
  return new Proxy(
    {},
    {
      get: (_target, key) =>
        key === '__esModule' ? true : () => mockReact.createElement(View),
    },
  );
});
jest.mock('@/components/WordRow', () => ({
  WordRow: ({ word }: { word: { term: string } }) => {
    const mockReact = require('react');
    const { Text: MockText } = require('react-native');
    return mockReact.createElement(MockText, null, word.term);
  },
}));
const card: Flashcard = {
  user_flashcard_id: 'cup',
  global_flashcard_id: 'global',
  keyword: 'cup',
  pronunciation: null,
  meaning_vi: 'cốc',
  example_1: 'A',
  example_2: 'B',
  related_words: [],
  audio_base64: null,
  status: 'CONFIRMED',
  interval: 1,
  repetitions: 0,
  efactor: 2.5,
  next_review_date: '2026-10-25',
};

test.each(['error', 'loading'])(
  'keeps a saved card visible during background %s',
  async kind => {
    const props = {
      cards: [card],
      saved: ['cup'],
      totalSaved: 0,
      user: { id: 'user' },
      token: 'token',
      hasMoreCards: false,
      loadingMoreCards: false,
      loadingData: kind === 'loading',
      dataError: kind === 'error' ? 'offline' : null,
      reloadData: jest.fn().mockResolvedValue(undefined),
      navigate: jest.fn(),
      openWord: jest.fn(),
    } as unknown as ScreenProps;
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<SavedScreen {...props} />);
    });
    try {
      expect(
        renderer.root
          .findAllByType(Text)
          .some(node => node.props.children === 'cup'),
      ).toBe(true);
      if (kind === 'error') {
        const button = renderer.root.findAll(
          node =>
            node.props.accessibilityLabel === 'Tải lại kho từ' &&
            typeof node.props.onPress === 'function',
        )[0];
        expect(button).toBeDefined();
        await ReactTestRenderer.act(async () => button.props.onPress());
        expect(props.reloadData).toHaveBeenCalledTimes(1);
      }
    } finally {
      await ReactTestRenderer.act(async () => renderer.unmount());
    }
  },
);
