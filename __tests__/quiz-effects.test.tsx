import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { AppState, AccessibilityInfo } from 'react-native';
import { QuizScreen } from '@/screens/learn/QuizScreen';
import { EffectsContext } from '@/hooks/effectsContext';
import { playSfx } from '@/utils/sfx';
import type { ScreenProps } from '@/types/screen';

jest.mock('lucide-react-native');
jest.mock('@/utils/sfx', () => ({ playSfx: jest.fn(() => jest.fn()) }));
jest.mock('@/hooks/useAudio', () => ({ useAudio: () => ({ play: jest.fn(), isPlaying: false }) }));
let mockDone = false;
jest.mock('@/screens/learn/hooks/useQuiz', () => ({ useQuiz: () => ({
  done: mockDone, index: 0, word: { id: 'cup', term: 'cup', meaning: 'cốc' },
  total: 10, score: 8, questions: [], options: [], missed: [], remaining: 0,
  selected: null, restart: jest.fn(), more: jest.fn(), retryMissed: jest.fn(),
}) }));
test('completion celebrates once and a later muted round keeps the same quiz result', async () => {
  Object.defineProperty(AppState, 'currentState', { value: 'active', configurable: true });
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  const props = { navigate: jest.fn(), practiceWords: [], due: [], cards: [] } as unknown as ScreenProps;
  const view = (soundEnabled: boolean) => <EffectsContext.Provider value={{ animationsEnabled: true, soundEnabled }}><QuizScreen {...props} /></EffectsContext.Provider>;
  let renderer!: Renderer.ReactTestRenderer;
  await act(async () => { renderer = Renderer.create(view(true)); });
  expect(playSfx).not.toHaveBeenCalled();
  await act(async () => { mockDone = true; renderer.update(view(true)); });
  expect(playSfx).toHaveBeenCalledTimes(1);
  expect(playSfx).toHaveBeenCalledWith('levelUp');
  expect(renderer.root.findAllByProps({ testID: 'lottie-view' }).length).toBeGreaterThan(0);
  await act(async () => renderer.update(view(true)));
  expect(playSfx).toHaveBeenCalledTimes(1);
  await act(async () => { mockDone = false; renderer.update(view(false)); });
  await act(async () => { mockDone = true; renderer.update(view(false)); });
  expect(playSfx).toHaveBeenCalledTimes(1);
  const result = JSON.stringify(renderer.toJSON());
  expect(result).toContain('8');
  expect(result).toContain('10');
  await act(async () => renderer.unmount());
  jest.restoreAllMocks();
});
