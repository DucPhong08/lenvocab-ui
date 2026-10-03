import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { launchImageLibrary } from 'react-native-image-picker';

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
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Bỏ lưu notebook' })
      .length,
  ).toBeGreaterThan(0);
  const savedTab = renderer.root.findAll(
    node =>
      node.props.accessibilityRole === 'tab' &&
      node.props.accessibilityLabel === 'Từ đã lưu',
  )[0];
  await ReactTestRenderer.act(async () => {
    savedTab.props.onPress();
  });
  expect(
    renderer.root.findAllByProps({
      accessibilityLabel: 'Xem từ notebook, nghĩa là quyển sổ tay',
    }).length,
  ).toBeGreaterThan(0);
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
