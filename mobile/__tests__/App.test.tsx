import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { launchImageLibrary } from 'react-native-image-picker';
import { authenticate, confirmFlashcard, gradeReview, scanImage } from '../src/api';

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
  expect(renderer.root.findAllByProps({ accessibilityLabel: 'Email' }).length).toBeGreaterThan(0);
  expect(renderer.root.findAllByProps({ accessibilityLabel: 'Đã lưu notebook' }).length).toBe(0);
  await ReactTestRenderer.act(async () => {
    renderer.unmount();
  });
});

test('marks chosen photos as examples and opens the quiz', async () => {
  jest.mocked(launchImageLibrary).mockResolvedValue({ assets: [{ uri: 'file:///photo.jpg' }] });
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => { renderer = ReactTestRenderer.create(<App />); });
  const cameraTab = renderer.root.findAll(node => node.props.accessibilityRole === 'tab' && node.props.accessibilityLabel === 'Quét ảnh')[0];
  await ReactTestRenderer.act(async () => { cameraTab.props.onPress(); });
  const gallery = renderer.root.findAllByProps({ accessibilityLabel: 'Chọn ảnh từ thư viện' }).find(node => typeof node.props.onPress === 'function');
  await ReactTestRenderer.act(async () => { await gallery?.props.onPress(); });
  expect(renderer.root.findAllByProps({ accessibilityLabel: 'Ảnh của bạn' }).length).toBeGreaterThan(0);
  const scan = renderer.root.findAllByProps({ accessibilityLabel: 'Xem từ vựng minh họa' }).find(node => typeof node.props.onPress === 'function');
  await ReactTestRenderer.act(async () => { scan?.props.onPress(); });
  expect(renderer.root.findAllByProps({ accessibilityLabel: 'Ảnh đã chọn' }).length).toBeGreaterThan(0);
  const reviewTab = renderer.root.findAll(node => node.props.accessibilityRole === 'tab' && node.props.accessibilityLabel === 'Ôn tập')[0];
  await ReactTestRenderer.act(async () => { reviewTab.props.onPress(); });
  const quiz = renderer.root.findAllByProps({ accessibilityLabel: 'Bắt đầu Quiz nhanh' }).find(node => typeof node.props.onPress === 'function');
  expect(quiz).toBeDefined();
  await ReactTestRenderer.act(async () => { quiz?.props.onPress(); });
  expect(renderer.root.findAllByProps({ accessibilityLabel: 'Quay lại' }).length).toBeGreaterThan(0);
  await ReactTestRenderer.act(async () => { renderer.unmount(); });
});

test('uses the real API root, Bearer token, multipart scan and review rating', async () => {
  const previousFetch = globalThis.fetch;
  const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ access_token: 'test-token', status: 'SUCCESS', keyword: 'mug', meaning_vi: 'cốc', example_1: 'A mug is on the table.', example_2: 'I use a mug.', related_words: [], audio_base64: null }) });
  globalThis.fetch = fetchMock;
  try {
    await authenticate('login', 'a@example.com', 'password123', '');
    await scanImage('test-token', { uri: 'file:///photo.jpg', fileName: 'photo.jpg', type: 'image/jpeg', fileSize: 1024 });
    await confirmFlashcard('test-token', { status: 'SUCCESS', keyword: 'mug', pronunciation: null, meaning_vi: 'cốc', example_1: 'A mug is on the table.', example_2: 'I use a mug.', related_words: [], audio_base64: null, detected_objects: [], bounding_box: null, message: null });
    await gradeReview('test-token', 'card-id', 4);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://app-lensvocab.onrender.com/auth/login',
      'https://app-lensvocab.onrender.com/vision/scan',
      'https://app-lensvocab.onrender.com/flashcards/confirm',
      'https://app-lensvocab.onrender.com/review/card-id',
    ]);
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer test-token');
    expect(fetchMock.mock.calls[1][1].body).toBeInstanceOf(FormData);
    expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toEqual({ quality: 4 });
  } finally { globalThis.fetch = previousFetch; }
});
