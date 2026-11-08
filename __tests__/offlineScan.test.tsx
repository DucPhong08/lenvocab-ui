import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import type { Asset } from 'react-native-image-picker';
import type { ScreenProps } from '@/types/screen';
import type { DetectionResult } from '@/specs/NativeOfflineVision';
import { OfflineScanScreen } from '@/screens/discover/OfflineScanScreen';

const mockDetect = jest.fn();
let mockSelect: (asset: Asset | null) => void;
jest.mock('@/services/vision/offlineDetector', () => ({
  offlineScanAvailable: true,
  detectOffline: (...args: unknown[]) => mockDetect(...args),
}));
jest.mock('@/screens/discover/hooks/useImagePicker', () => ({
  useImagePicker: (select: typeof mockSelect) => {
    mockSelect = select;
    return jest.fn();
  },
}));
let renderer: ReactTestRenderer.ReactTestRenderer;
const result: DetectionResult = {
  width: 800,
  height: 600,
  elapsedMs: 120,
  objects: [
    {
      labelId: 46,
      label: 'cup',
      score: 0.82,
      box: { left: 0.1, top: 0.2, width: 0.3, height: 0.4 },
    },
  ],
};
const visibleText = () =>
  renderer.root
    .findAllByType(Text)
    .flatMap(item => item.children.filter(child => typeof child === 'string'))
    .join(' ');
const props = { navigate: jest.fn(), user: null } as unknown as ScreenProps;
const button = () =>
  renderer.root
    .findAllByProps({ accessibilityLabel: 'Nhận diện trên máy' })
    .find(item => typeof item.props.onPress === 'function')!;
beforeEach(() => {
  jest.clearAllMocks();
});
afterEach(async () => {
  await act(async () => renderer?.unmount());
});

test('renders local labels and boxes without a server request', async () => {
  const request = jest.spyOn(globalThis, 'fetch');
  mockDetect.mockResolvedValue(result);
  await act(async () => {
    renderer = ReactTestRenderer.create(<OfflineScanScreen {...props} />);
  });
  await act(async () => {
    mockSelect({ uri: 'file:///cup.jpg', width: 800, height: 600 });
  });
  await act(async () => {
    await button().props.onPress();
  });
  expect(mockDetect).toHaveBeenCalledWith(
    expect.objectContaining({ uri: 'file:///cup.jpg' }),
    expect.objectContaining({
      max_detected_objects: 5,
      confidence_threshold: 0.5,
    }),
  );
  expect(JSON.stringify(renderer.toJSON())).toContain('cup');
  expect(JSON.stringify(renderer.toJSON())).toContain('cốc');
  expect(request).not.toHaveBeenCalled();
  request.mockRestore();
});

test('a late result cannot replace a newly selected photo or leave the controls busy', async () => {
  let resolve!: (value: DetectionResult) => void;
  mockDetect.mockReturnValue(
    new Promise(done => {
      resolve = done;
    }),
  );
  await act(async () => {
    renderer = ReactTestRenderer.create(<OfflineScanScreen {...props} />);
  });
  await act(async () => {
    mockSelect({ uri: 'file:///old.jpg' });
  });
  let pending!: Promise<void>;
  await act(async () => {
    pending = button().props.onPress();
  });
  await act(async () => {
    mockSelect({ uri: 'file:///new.jpg' });
    resolve(result);
    await pending;
  });
  expect(visibleText()).not.toContain('cup');
  expect(button().props.disabled).toBe(false);
});

test('intro and inference follow the effective account settings and update together', async () => {
  const user = {
    id: 'learner',
    preferences: { max_detected_objects: 10, target_language: 'en' },
    scan_settings: {
      max_detected_objects: 8,
      max_allowed_objects: 8,
      confidence_threshold: 0.7,
    },
  } as ScreenProps['user'];
  mockDetect.mockResolvedValue(result);
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <OfflineScanScreen {...props} user={user} />,
    );
  });
  expect(JSON.stringify(renderer.toJSON())).toContain('tối đa 8 vật');
  await act(async () => {
    mockSelect({ uri: 'file:///cup.jpg' });
  });
  await act(async () => {
    await button().props.onPress();
  });
  expect(mockDetect).toHaveBeenLastCalledWith(
    expect.anything(),
    user!.scan_settings,
  );
  expect(JSON.stringify(renderer.toJSON())).not.toContain('cốc');
  const changed = {
    ...user!,
    preferences: { ...user!.preferences, max_detected_objects: 2 },
    scan_settings: { ...user!.scan_settings!, max_detected_objects: 2 },
  };
  await act(async () => {
    renderer.update(<OfflineScanScreen {...props} user={changed} offline />);
  });
  expect(JSON.stringify(renderer.toJSON())).toContain('tối đa 2 vật');
  expect(JSON.stringify(renderer.toJSON())).toContain('gần nhất');
  expect(visibleText()).not.toContain('cup');
  await act(async () => {
    await button().props.onPress();
  });
  expect(mockDetect).toHaveBeenLastCalledWith(
    expect.anything(),
    changed.scan_settings,
  );
});

test('discard a result computed with settings that changed while processing', async () => {
  let resolve!: (value: DetectionResult) => void;
  mockDetect.mockReturnValue(
    new Promise(done => {
      resolve = done;
    }),
  );
  const user = {
    id: 'learner',
    preferences: { max_detected_objects: 8 },
    scan_settings: {
      max_detected_objects: 8,
      max_allowed_objects: 10,
      confidence_threshold: 0.5,
    },
  } as ScreenProps['user'];
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <OfflineScanScreen {...props} user={user} />,
    );
  });
  await act(async () => {
    mockSelect({ uri: 'file:///cup.jpg' });
  });
  let pending!: Promise<void>;
  await act(async () => {
    pending = button().props.onPress();
  });
  await act(async () => {
    renderer.update(
      <OfflineScanScreen
        {...props}
        user={{
          ...user!,
          scan_settings: { ...user!.scan_settings!, max_detected_objects: 2 },
        }}
      />,
    );
  });
  await act(async () => {
    resolve(result);
    await pending;
  });
  expect(visibleText()).not.toContain('cup');
  expect(button().props.disabled).toBe(false);
});
