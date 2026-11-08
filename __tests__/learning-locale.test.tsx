import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { WordRow } from '@/components/WordRow';
import { useStudyExit } from '@/screens/learn/hooks/useStudyExit';
import { useAudio } from '@/hooks/useAudio';
import { AudioContext } from '@/hooks/audioContext';
import { getCardAudio } from '@/api/endpoints/getCardAudio';
import { I18nProvider, useI18n, type I18nContextType } from '@/i18n';
import { getWord } from '@/data/getWord';

jest.mock('lucide-react-native');
jest.mock('react-native-fs');
jest.mock('@/components/CardImage', () => ({ CardImage: () => null }));
jest.mock('@/api/endpoints/getCardAudio', () => ({ getCardAudio: jest.fn() }));
const mockStop = jest.fn((callback: () => void) => callback());
const mockRelease = jest.fn();
const mockPlay = jest.fn();
jest.mock('react-native-sound', () => class {
  static setCategory = jest.fn();
  constructor(_path: string, _base: string, ready: (error: null) => void) {
    Promise.resolve().then(() => ready(null));
  }
  setSpeed = jest.fn();
  play = mockPlay;
  stop = mockStop;
  release = mockRelease;
});

let renderer: Renderer.ReactTestRenderer | undefined;
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(async () => {
  await act(async () => renderer?.unmount());
  renderer = undefined;
  jest.restoreAllMocks();
});

test('word rows use English labels for opening, listening, saving and saved state', async () => {
  const props = {
    word: { ...getWord('notebook'), audio: 'sample-audio' },
    saved: false,
    onOpen: jest.fn(),
    onSave: jest.fn(),
  };
  const view = (saved: boolean) => (
    <I18nProvider initialLocale="en"><WordRow {...props} saved={saved} /></I18nProvider>
  );
  await act(async () => { renderer = Renderer.create(view(false)); });
  const text = () => JSON.stringify(renderer!.toJSON());
  expect(text()).toContain('Open notebook, meaning quyển sổ tay');
  expect(text()).toContain('Listen to notebook');
  expect(text()).toContain('Save notebook');
  await act(async () => renderer!.update(view(true)));
  expect(text()).toContain('Saved notebook');
});

test('study exit dialogs and busy feedback use English and preserve navigation choices', async () => {
  const navigate = jest.fn();
  let exit!: () => void;
  function Harness({ busy }: { busy: boolean }) {
    exit = useStudyExit({ navigate, active: true, busy });
    return null;
  }
  const view = (busy: boolean) => (
    <I18nProvider initialLocale="en"><Harness busy={busy} /></I18nProvider>
  );
  await act(async () => { renderer = Renderer.create(view(false)); });
  await act(async () => exit());
  expect(Alert.alert).toHaveBeenLastCalledWith(
    'Leave this study round?',
    'This round will start over. Reviews already saved will be kept.',
    expect.any(Array),
  );
  const actions = jest.mocked(Alert.alert).mock.calls.at(-1)![2]!;
  expect(actions.map(item => item.text)).toEqual(['Continue', 'Leave round']);
  expect(navigate).not.toHaveBeenCalled();
  await act(async () => actions[1].onPress?.());
  expect(navigate).toHaveBeenCalledWith('review');
  navigate.mockClear();
  await act(async () => renderer!.update(view(true)));
  await act(async () => exit());
  expect(Alert.alert).toHaveBeenLastCalledWith(
    'Saving review', 'Wait for this review to save before leaving.',
  );
  expect(navigate).not.toHaveBeenCalled();
});

test('offline audio feedback uses the selected English locale', async () => {
  let audio!: ReturnType<typeof useAudio>;
  function Harness() { audio = useAudio(); return null; }
  await act(async () => {
    renderer = Renderer.create(
      <I18nProvider initialLocale="en">
        <AudioContext.Provider value={{ token: 'u', speed: 1, offline: true }}>
          <Harness />
        </AudioContext.Provider>
      </I18nProvider>,
    );
  });
  await act(async () => audio.play(null, 'card'));
  expect(Alert.alert).toHaveBeenLastCalledWith(
    'Audio requires internet',
    'You can still study downloaded definitions and example sentences.',
  );
  expect(getCardAudio).not.toHaveBeenCalled();
});

test('changing language keeps the current player and callback while updating later audio errors', async () => {
  let audio!: ReturnType<typeof useAudio>;
  let locale!: I18nContextType;
  function Harness() { audio = useAudio(); locale = useI18n(); return null; }
  await act(async () => {
    renderer = Renderer.create(
      <I18nProvider initialLocale="vi">
        <AudioContext.Provider value={{ token: 'u', speed: 1 }}>
          <Harness />
        </AudioContext.Provider>
      </I18nProvider>,
    );
  });
  await act(async () => audio.play('sample-audio'));
  const play = audio.play;
  await act(async () => locale.setLocale('en'));
  expect(audio.play).toBe(play);
  expect(mockPlay).toHaveBeenCalledTimes(1);
  expect(mockStop).not.toHaveBeenCalled();
  expect(mockRelease).not.toHaveBeenCalled();
  jest.mocked(getCardAudio).mockRejectedValueOnce({});
  await act(async () => audio.play(null, 'card'));
  expect(Alert.alert).toHaveBeenLastCalledWith('Unable to play audio', 'Please try again.');
});
