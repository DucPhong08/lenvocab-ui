import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { launchImageLibrary } from 'react-native-image-picker';
import * as Keychain from 'react-native-keychain';
import { authenticate } from '@/api/endpoints/authenticate';
import { confirmFlashcard } from '@/api/endpoints/confirmFlashcard';
import { gradeReview } from '@/api/endpoints/gradeReview';
import { scanImage } from '@/api/endpoints/scanImage';

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  const mockReact = require('react');
  return new Proxy(
    {},
    {
      get: (_target, name) =>
        name === '__esModule' ? true : () => mockReact.createElement(View),
    },
  );
});
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn().mockResolvedValue(false),
  setGenericPassword: jest.fn().mockResolvedValue(true),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn().mockResolvedValue(true),
    requestPermission: jest.fn().mockResolvedValue({ authorizationStatus: 1 }),
    displayNotification: jest.fn().mockResolvedValue(true),
    createTriggerNotification: jest.fn().mockResolvedValue(true),
  },
  AndroidImportance: { HIGH: 4 },
  AuthorizationStatus: { AUTHORIZED: 1 },
  TriggerType: { TIMESTAMP: 0 },
  RepeatFrequency: { DAILY: 0 },
}));
jest.mock('react-native-sound', () => {
  class MockSound {
    static setCategory = jest.fn();
    play = jest.fn((cb?: (success: boolean) => void) => cb?.(true));
    stop = jest.fn((cb?: () => void) => cb?.());
    release = jest.fn();
  }
  return MockSound;
});
jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/tmp',
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

test('navigates from home to sample image selection', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  const hero = renderer.root.findAllByProps({
    accessibilityLabel: 'Bắt đầu chọn hoặc chụp ảnh',
  })[0];
  expect(hero).toBeDefined();
  await ReactTestRenderer.act(async () => {
    hero.props.onPress();
  });
  expect(
    renderer.root.findAllByProps({
      accessibilityLabel: 'Chọn cảnh Góc học tập',
    }).length,
  ).toBeGreaterThan(0);
  const scan = renderer.root
    .findAllByProps({ accessibilityLabel: 'Xem từ vựng minh họa' })
    .find(node => typeof node.props.onPress === 'function');
  await ReactTestRenderer.act(async () => {
    scan?.props.onPress();
  });
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Lưu notebook' }).length,
  ).toBeGreaterThan(0);
  const save = renderer.root
    .findAllByProps({ accessibilityLabel: 'Lưu notebook' })
    .find(node => typeof node.props.onPress === 'function');
  await ReactTestRenderer.act(async () => {
    save?.props.onPress();
  });
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Email' }).length,
  ).toBeGreaterThan(0);
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Đã lưu notebook' })
      .length,
  ).toBe(0);
  await ReactTestRenderer.act(async () => {
    renderer.unmount();
  });
});

test('scans chosen photos as a guest and opens the quiz', async () => {
  const previousFetch = globalThis.fetch;
  const fetchMock = jest
    .fn()
    .mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'OK',
        keyword: 'mug',
        meaning_vi: 'cốc',
        example_1: 'A mug.',
        example_2: 'My mug.',
        related_words: [],
        detected_objects: [],
      }),
    });
  globalThis.fetch = fetchMock;
  try {
    jest
      .mocked(launchImageLibrary)
      .mockResolvedValue({ assets: [{ uri: 'file:///photo.jpg' }] });
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });
    const cameraTab = renderer.root.findAll(
      node =>
        node.props.accessibilityRole === 'tab' &&
        node.props.accessibilityLabel === 'Quét ảnh',
    )[0];
    await ReactTestRenderer.act(async () => {
      cameraTab.props.onPress();
    });
    const gallery = renderer.root
      .findAllByProps({ accessibilityLabel: 'Chọn ảnh từ thư viện' })
      .find(node => typeof node.props.onPress === 'function');
    await ReactTestRenderer.act(async () => {
      await gallery?.props.onPress();
    });
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Ảnh của bạn' })
        .length,
    ).toBeGreaterThan(0);
    const scan = renderer.root
      .findAllByProps({ accessibilityLabel: 'Quét ảnh bằng AI' })
      .find(node => typeof node.props.onPress === 'function');
    await ReactTestRenderer.act(async () => {
      await scan?.props.onPress();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://app-lensvocab.onrender.com/vision/scan/guest',
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) }),
    );
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Ảnh đã chọn' })
        .length,
    ).toBeGreaterThan(0);
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Lưu mug' }).length,
    ).toBeGreaterThan(0);
    const reviewTab = renderer.root.findAll(
      node =>
        node.props.accessibilityRole === 'tab' &&
        node.props.accessibilityLabel === 'Ôn tập',
    )[0];
    await ReactTestRenderer.act(async () => {
      reviewTab.props.onPress();
    });
    const quiz = renderer.root
      .findAllByProps({ accessibilityLabel: 'Bắt đầu Quiz nhanh' })
      .find(node => typeof node.props.onPress === 'function');
    expect(quiz).toBeDefined();
    await ReactTestRenderer.act(async () => {
      quiz?.props.onPress();
    });
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Quay lại' }).length,
    ).toBeGreaterThan(0);
    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('uses the real API root, Bearer token, multipart scan and review rating', async () => {
  const previousFetch = globalThis.fetch;
  const fetchMock = jest
    .fn()
    .mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'test-token',
        status: 'SUCCESS',
        keyword: 'mug',
        meaning_vi: 'cốc',
        example_1: 'A mug is on the table.',
        example_2: 'I use a mug.',
        related_words: [],
        audio_base64: null,
      }),
    });
  globalThis.fetch = fetchMock;
  try {
    await authenticate('login', 'a@example.com', 'password123', '');
    await scanImage('test-token', {
      uri: 'file:///photo.jpg',
      fileName: 'photo.jpg',
      type: 'image/jpeg',
      fileSize: 1024,
    });
    await confirmFlashcard('test-token', {
      status: 'OK',
      keyword: 'mug',
      pronunciation: null,
      meaning_vi: 'cốc',
      example_1: 'A mug is on the table.',
      example_2: 'I use a mug.',
      related_words: [],
      aliases: [],
      categories: [],
      parents: [],
      audio_base64: null,
      confidence: 99,
      detected_objects: [],
      bounding_box: null,
      source: 'bedrock',
      is_draft: true,
      message: null,
    });
    await gradeReview(
      'test-token',
      'card-id',
      4,
      '2b671a64-40d5-491e-99b0-da01ff1f3341',
    );
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://app-lensvocab.onrender.com/auth/login',
      'https://app-lensvocab.onrender.com/vision/scan',
      'https://app-lensvocab.onrender.com/flashcards/confirm',
      'https://app-lensvocab.onrender.com/review/card-id',
    ]);
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe(
      'Bearer test-token',
    );
    expect(fetchMock.mock.calls[1][1].body).toBeInstanceOf(FormData);
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({
      keyword: 'mug',
    });
    expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toEqual({
      quality: 4,
      review_id: '2b671a64-40d5-491e-99b0-da01ff1f3341',
    });
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('does not apply a completed grade after logout', async () => {
  jest.useFakeTimers();
  const previousFetch = globalThis.fetch;
  let resolveGrade!: (value: unknown) => void;
  const gradeResponse = new Promise(resolve => {
    resolveGrade = resolve;
  });
  const card = {
    user_flashcard_id: 'card-session',
    global_flashcard_id: 'global-session',
    keyword: 'chair',
    pronunciation: null,
    meaning_vi: 'cái ghế',
    example_1: 'This is a chair.',
    example_2: 'The chair is blue.',
    related_words: [],
    audio_base64: null,
    status: 'CONFIRMED',
    interval: 1,
    repetitions: 0,
    efactor: 2.5,
    next_review_date: '2026-10-11',
  };
  const fetchMock = jest.fn((url: string) => {
    if (url.endsWith('/auth/me')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 'user-session',
          email: 'user@example.com',
          display_name: null,
          account_tier: 'FREE',
          daily_quota_left: 2,
          is_active: true,
          preferences: {
            preferred_voice_id: 'Joanna',
            voice_speed: 1,
            daily_review_goal: 15,
            target_language: 'vi',
            max_detected_objects: 5,
          },
        }),
      });
    }
    if (url.endsWith('/flashcards')) {
      return Promise.resolve({ ok: true, json: async () => [card] });
    }
    if (url.endsWith('/review/today')) {
      return Promise.resolve({ ok: true, json: async () => [card] });
    }
    if (url.endsWith('/review/card-session')) return gradeResponse;
    throw new Error(`Unexpected URL: ${url}`);
  });
  globalThis.fetch = fetchMock as typeof fetch;
  jest.mocked(Keychain.getGenericPassword).mockResolvedValueOnce({
    username: 'session',
    password: 'session-token',
  } as Awaited<ReturnType<typeof Keychain.getGenericPassword>>);
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  try {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });
    const reviewTab = renderer.root.findByProps({
      accessibilityLabel: 'Ôn tập',
    });
    await ReactTestRenderer.act(async () => reviewTab.props.onPress());
    const flashcards = renderer.root.findByProps({
      accessibilityLabel: 'Bắt đầu Flashcards',
    });
    await ReactTestRenderer.act(async () => flashcards.props.onPress());
    const flip = renderer.root.findByProps({
      accessibilityLabel: 'chair. Chạm để xem nghĩa tiếng Việt',
    });
    await ReactTestRenderer.act(async () => flip.props.onPress());
    const grade = renderer.root.findByProps({
      accessibilityLabel: '4 điểm: Nhớ tốt',
    });
    let pendingGrade!: Promise<void>;
    ReactTestRenderer.act(() => {
      pendingGrade = grade.props.onPress();
    });

    const profileTab = renderer.root.findByProps({
      accessibilityLabel: 'Cá nhân',
    });
    await ReactTestRenderer.act(async () => profileTab.props.onPress());
    const logout = renderer.root.findByProps({ label: 'Đăng xuất' });
    await ReactTestRenderer.act(async () => logout.props.onPress());
    await ReactTestRenderer.act(async () => {
      resolveGrade({
        ok: true,
        json: async () => ({
          user_flashcard_id: 'card-session',
          interval_after: 6,
          repetitions_after: 1,
          efactor_after: 2.6,
          next_review_date: '2026-10-17',
          message: 'saved',
        }),
      });
      await pendingGrade;
    });

    const getCalls = fetchMock.mock.calls.filter(
      ([url]) =>
        url.endsWith('/auth/me') ||
        url.endsWith('/flashcards') ||
        url.endsWith('/review/today'),
    );
    expect(getCalls).toHaveLength(3);
  } finally {
    globalThis.fetch = previousFetch;
    await ReactTestRenderer.act(async () => renderer?.unmount());
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  }
});
