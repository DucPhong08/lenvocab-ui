import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  AccessibilityInfo,
  AppState,
  Text,
  type AppStateStatus,
} from 'react-native';
import { commands } from '../__mocks__/lottie-react-native';
import animation from '../assets/animations/celebration-confetti.json';
import { LottieAnimation } from '@/components/LottieAnimation';
import { EffectsContext } from '@/hooks/effectsContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { playSfx, type SfxType } from '@/utils/sfx';

const mockStop = jest.fn();
jest.mock('@/utils/sfx', () => ({ playSfx: jest.fn(() => mockStop) }));
let onReduce: (value: boolean) => void;
const states = new Set<(state: AppStateStatus) => void>();
let renderer: Renderer.ReactTestRenderer;
const native = () => renderer.root.findAllByProps({ testID: 'lottie-view' })[0];
const view = (enabled = true) => (
  <EffectsContext.Provider
    value={{ animationsEnabled: enabled, soundEnabled: true }}
  >
    <LottieAnimation source={animation} fallback={<Text>Hoàn thành</Text>} />
  </EffectsContext.Provider>
);
async function state(value: AppStateStatus) {
  await act(async () => {
    states.forEach(listener => listener(value));
  });
}
beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(AppState, 'currentState', {
    value: 'active',
    configurable: true,
  });
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(false);
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation((_, listener) => {
      onReduce = listener as (value: boolean) => void;
      return { remove: jest.fn() };
    });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
    const callback = listener as (value: AppStateStatus) => void;
    states.add(callback);
    return { remove: () => states.delete(callback) };
  });
});
afterEach(async () => {
  await act(async () => renderer?.unmount());
  expect(states.size).toBe(0);
  jest.restoreAllMocks();
});

test('plays once, pauses in the background, resumes and never replays a completed animation', async () => {
  await act(async () => {
    renderer = Renderer.create(view());
  });
  expect(commands.play).not.toHaveBeenCalled();
  await act(async () => native().props.onAnimationLoaded());
  expect(commands.play).toHaveBeenCalledTimes(1);
  expect(native().props.loop).toBe(false);
  await state('background');
  expect(commands.pause).toHaveBeenCalled();
  await state('active');
  expect(commands.resume).toHaveBeenCalledTimes(1);
  await act(async () => native().props.onAnimationFinish(false));
  await state('background');
  await state('active');
  expect(commands.play).toHaveBeenCalledTimes(1);
  expect(commands.resume).toHaveBeenCalledTimes(1);
  expect(native().props.style).toEqual(
    expect.arrayContaining([{ opacity: 0 }]),
  );
});

test('responds immediately to Reduce Motion and account settings', async () => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
  await act(async () => {
    renderer = Renderer.create(view());
  });
  await act(async () => native().props.onAnimationLoaded());
  expect(commands.play).not.toHaveBeenCalled();
  await act(async () => onReduce(false));
  expect(commands.play).toHaveBeenCalledTimes(1);
  await act(async () => onReduce(true));
  expect(native().props.style).toEqual(
    expect.arrayContaining([{ opacity: 0 }]),
  );
  await act(async () => {
    renderer.update(view(false));
    onReduce(false);
  });
  expect(native().props.style).toEqual(
    expect.arrayContaining([{ opacity: 0 }]),
  );
  expect(commands.play).toHaveBeenCalledTimes(1);
});

test('keeps the fallback when native rendering fails', async () => {
  await act(async () => {
    renderer = Renderer.create(view());
  });
  await act(async () => {
    native().props.onAnimationLoaded();
  });
  await act(async () => {
    native().props.onAnimationFailure('invalid');
  });
  expect(native().props.style).toEqual(
    expect.arrayContaining([{ opacity: 0 }]),
  );
  expect(JSON.stringify(renderer.toJSON())).toContain('Hoàn thành');
});

test('a late initial accessibility read cannot overwrite a newer setting event', async () => {
  let resolve!: (value: boolean) => void;
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockReturnValue(
    new Promise(done => {
      resolve = done;
    }),
  );
  await act(async () => {
    renderer = Renderer.create(view());
  });
  await act(async () => {
    native().props.onAnimationLoaded();
    onReduce(true);
    resolve(false);
  });
  expect(commands.play).not.toHaveBeenCalled();
  await act(async () => onReduce(false));
  expect(commands.play).toHaveBeenCalledTimes(1);
});

test('sound respects its own setting and stops when leaving the app without replaying on return', async () => {
  let play!: (type: SfxType) => void;
  function Probe() {
    play = useSoundEffects();
    return null;
  }
  const sound = (enabled: boolean) => (
    <EffectsContext.Provider
      value={{ animationsEnabled: false, soundEnabled: enabled }}
    >
      <Probe />
    </EffectsContext.Provider>
  );
  await act(async () => {
    renderer = Renderer.create(sound(false));
  });
  await act(async () => play('levelUp'));
  expect(playSfx).not.toHaveBeenCalled();
  await act(async () => renderer.update(sound(true)));
  await act(async () => play('levelUp'));
  expect(playSfx).toHaveBeenCalledWith('levelUp');
  await state('background');
  expect(mockStop).toHaveBeenCalledTimes(1);
  await act(async () => play('correct'));
  expect(playSfx).toHaveBeenCalledTimes(1);
  await state('active');
  expect(playSfx).toHaveBeenCalledTimes(1);
  await act(async () => play('correct'));
  await act(async () => renderer.update(sound(false)));
  expect(mockStop).toHaveBeenCalledTimes(2);
});
