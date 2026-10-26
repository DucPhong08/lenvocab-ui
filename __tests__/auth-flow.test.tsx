import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { Text, TextInput } from 'react-native';
import { SWRConfig } from 'swr';
import { googleIdToken } from '@/services/auth/googleSignIn';
import { AuthScreen } from '@/screens/account/AuthScreen';
import { launchImageLibrary } from 'react-native-image-picker';
import * as Keychain from 'react-native-keychain';

jest.mock('@react-native-community/image-editor', () => ({
  __esModule: true,
  default: { cropImage: jest.fn() },
}));
jest.mock('@/services/auth/googleSignIn', () => ({ googleIdToken: jest.fn() }));

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

function press(renderer: ReactTestRenderer.ReactTestRenderer, label: string) {
  const button = renderer.root
    .findAllByProps({ accessibilityLabel: label })
    .find(node => typeof node.props.onPress === 'function');
  if (!button) throw new Error(`Missing button: ${label}`);
  return button.props.onPress();
}

function enter(
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
  value: string,
) {
  const input = renderer.root
    .findAllByProps({ accessibilityLabel: label })
    .find(node => typeof node.props.onChangeText === 'function');
  if (!input) throw new Error(`Missing input: ${label}`);
  input.props.onChangeText(value);
}

function guestAccountFetch() {
  let stored = false;
  const card = {
    user_flashcard_id: 'guest-card',
    global_flashcard_id: 'global-mug',
    keyword: 'mug',
    meaning_vi: 'cốc',
    related_words: [],
    status: 'CONFIRMED',
  };
  const response = (body: unknown) => ({ ok: true, json: async () => body });
  return jest.fn(async (url: string) => {
    if (url.endsWith('/vision/scan/guest')) {
      return response({
        status: 'OK',
        keyword: 'mug',
        meaning_vi: 'cốc',
        related_words: [],
        detected_objects: [],
      });
    }
    if (
      url.endsWith('/auth/login') ||
      url.endsWith('/auth/register') ||
      url.endsWith('/auth/google')
    ) {
      return response({ access_token: 'guest-conversion-token' });
    }
    if (url.endsWith('/auth/me')) {
      return response({
        id: 'guest-user',
        email: 'learner@example.com',
        display_name: null,
        account_tier: 'FREE',
        daily_quota_left: 10,
      });
    }
    if (url.endsWith('/flashcards/guest-card/image')) {
      return response({
        image_url: 'https://private.example/guest-photo',
        has_image: true,
      });
    }
    if (url.endsWith('/flashcards/confirm')) {
      stored = true;
      return response(card);
    }
    if (url.includes('/flashcards/page?'))
      return response({
        items: stored ? [card] : [],
        total: stored ? 1 : 0,
        next_offset: null,
      });
    if (url.endsWith('/review/today')) return response([]);
    throw new Error(`Unexpected URL: ${url}`);
  });
}

async function mountGuestScan() {
  jest.mocked(Keychain.getGenericPassword).mockResolvedValueOnce(false);
  jest
    .mocked(launchImageLibrary)
    .mockResolvedValueOnce({ assets: [{ uri: 'file:///guest-mug.jpg' }] });
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <App />
      </SWRConfig>,
    );
  });
  await ReactTestRenderer.act(async () => press(renderer, 'Quét ảnh'));
  await ReactTestRenderer.act(async () =>
    press(renderer, 'Chọn ảnh từ thư viện'),
  );
  await ReactTestRenderer.act(async () => press(renderer, 'Quét ảnh bằng AI'));
  return renderer;
}

async function submitAccount(
  renderer: ReactTestRenderer.ReactTestRenderer,
  mode: 'login' | 'register',
) {
  if (mode === 'register') {
    const label = renderer.root
      .findByType(AuthScreen)
      .findAllByType(Text)
      .find(node => node.props.children === 'Chưa có tài khoản? Đăng ký')!;
    let button = label.parent;
    while (button && typeof button.props.onPress !== 'function')
      button = button.parent;
    if (!button) throw new Error('Missing register switch');
    await ReactTestRenderer.act(async () => button!.props.onPress());
  }
  await ReactTestRenderer.act(async () => {
    enter(renderer, 'Username', 'learner');
    enter(renderer, 'Mật khẩu', 'password123');
  });
  await ReactTestRenderer.act(async () =>
    press(renderer, mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'),
  );
}

test.each([
  ['login', 'Đăng nhập để lưu từ'],
  ['register', 'Đăng nhập để lưu từ'],
  ['login', 'Lưu mug'],
] as const)(
  'resumes guest save after %s using %s',
  async (mode, saveButton) => {
    const previousFetch = globalThis.fetch;
    const fetchMock = guestAccountFetch();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    try {
      renderer = await mountGuestScan();
      await ReactTestRenderer.act(async () => press(renderer, saveButton));
      await submitAccount(renderer, mode);
      const confirmations = fetchMock.mock.calls.filter(([url]) =>
        url.endsWith('/flashcards/confirm'),
      );
      expect(confirmations).toHaveLength(1);
      expect(
        fetchMock.mock.calls.filter(([url]) =>
          url.endsWith('/flashcards/guest-card/image'),
        ),
      ).toHaveLength(1);
      expect(
        renderer.root.findAllByProps({ accessibilityLabel: 'Ảnh đã chọn' })
          .length,
      ).toBeGreaterThan(0);
      expect(
        renderer.root.findAllByProps({ accessibilityLabel: 'Xem từ đã lưu' })
          .length,
      ).toBeGreaterThan(0);
    } finally {
      await ReactTestRenderer.act(async () => renderer?.unmount());
      globalThis.fetch = previousFetch;
    }
  },
);

test('cancels guest save when leaving authentication before a later normal login', async () => {
  const previousFetch = globalThis.fetch;
  const fetchMock = guestAccountFetch();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  try {
    renderer = await mountGuestScan();
    await ReactTestRenderer.act(async () => press(renderer, 'Lưu mug'));
    await ReactTestRenderer.act(async () => press(renderer, 'Quay lại'));
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Lưu mug' }).length,
    ).toBeGreaterThan(0);
    await ReactTestRenderer.act(async () => press(renderer, 'Cá nhân'));
    await ReactTestRenderer.act(async () =>
      press(renderer, 'Đăng nhập để đồng bộ'),
    );
    await submitAccount(renderer, 'login');
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        url.endsWith('/flashcards/confirm'),
      ),
    ).toHaveLength(0);
    expect(
      renderer.root.findAllByProps({
        accessibilityLabel: 'Bắt đầu chọn hoặc chụp ảnh',
      }).length,
    ).toBeGreaterThan(0);
    await ReactTestRenderer.act(async () => press(renderer, 'Cá nhân'));
    const text = renderer.root
      .findAllByType(Text)
      .map(node => node.props.children);
    expect(text).toContain('Người học');
    expect(text).not.toContain('Khách tham quan');
  } finally {
    await ReactTestRenderer.act(async () => renderer?.unmount());
    globalThis.fetch = previousFetch;
  }
});

test('can reveal and hide the entered password', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  try {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });
    await ReactTestRenderer.act(async () => press(renderer, 'Cá nhân'));
    await ReactTestRenderer.act(async () =>
      press(renderer, 'Đăng nhập để đồng bộ'),
    );
    await ReactTestRenderer.act(async () =>
      enter(renderer, 'Mật khẩu', 'pass123'),
    );
    const password = () =>
      renderer.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Mật khẩu')!;
    expect(password().props.secureTextEntry).toBe(true);
    await ReactTestRenderer.act(async () => press(renderer, 'Hiện mật khẩu'));
    expect(password().props.secureTextEntry).toBe(false);
    expect(password().props.value).toBe('pass123');
    await ReactTestRenderer.act(async () => press(renderer, 'Ẩn mật khẩu'));
    expect(password().props.secureTextEntry).toBe(true);
    expect(password().props.value).toBe('pass123');
  } finally {
    await ReactTestRenderer.act(async () => renderer?.unmount());
  }
});

test('keeps the requested guest save when login fails, then resumes on retry', async () => {
  const previousFetch = globalThis.fetch;
  const fetchMock = guestAccountFetch();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  try {
    renderer = await mountGuestScan();
    await ReactTestRenderer.act(async () => press(renderer, 'Lưu mug'));
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    await submitAccount(renderer, 'login');
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Username' }).length,
    ).toBeGreaterThan(0);
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        url.endsWith('/flashcards/confirm'),
      ),
    ).toHaveLength(0);
    await ReactTestRenderer.act(async () => press(renderer, 'Đăng nhập'));
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        url.endsWith('/flashcards/confirm'),
      ),
    ).toHaveLength(1);
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Xem từ đã lưu' })
        .length,
    ).toBeGreaterThan(0);
  } finally {
    await ReactTestRenderer.act(async () => renderer?.unmount());
    globalThis.fetch = previousFetch;
  }
});

test('resumes the requested guest save after Google login', async () => {
  const previousFetch = globalThis.fetch;
  const fetchMock = guestAccountFetch();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  jest.mocked(googleIdToken).mockResolvedValueOnce('google-id-token');
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  try {
    renderer = await mountGuestScan();
    await ReactTestRenderer.act(async () => press(renderer, 'Lưu mug'));
    await ReactTestRenderer.act(async () =>
      press(renderer, 'Tiếp tục với Google'),
    );
    expect(
      fetchMock.mock.calls.filter(([url]) => url.endsWith('/auth/google')),
    ).toHaveLength(1);
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        url.endsWith('/flashcards/confirm'),
      ),
    ).toHaveLength(1);
  } finally {
    await ReactTestRenderer.act(async () => renderer?.unmount());
    globalThis.fetch = previousFetch;
  }
});

test('a missing Google configuration leaves username login usable', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  jest
    .mocked(googleIdToken)
    .mockRejectedValueOnce(new Error('Google chưa được thiết lập.'));
  try {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });
    await ReactTestRenderer.act(async () => press(renderer, 'Cá nhân'));
    await ReactTestRenderer.act(async () =>
      press(renderer, 'Đăng nhập để đồng bộ'),
    );
    await ReactTestRenderer.act(async () =>
      press(renderer, 'Tiếp tục với Google'),
    );
    expect(
      renderer.root
        .findAllByType(Text)
        .some(node => node.props.children === 'Google chưa được thiết lập.'),
    ).toBe(true);
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Username' }).length,
    ).toBeGreaterThan(0);
  } finally {
    await ReactTestRenderer.act(async () => renderer?.unmount());
  }
});
