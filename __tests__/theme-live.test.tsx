import React, { useState } from 'react';
import Renderer from 'react-test-renderer';
import { StyleSheet, Text } from 'react-native';
import { ThemeProvider, useTheme } from '@/theme/context/ThemeProvider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AppTabs } from '@/app/AppTabs';
import { Eyebrow } from '@/components/Eyebrow';

jest.mock('lucide-react-native');

let view: Renderer.ReactTestRenderer;
let theme: ReturnType<typeof useTheme>;

function Probe() {
  theme = useTheme();
  const [count, setCount] = useState(0);
  return (
    <>
      <PrimaryButton
        label={`Count ${count}`}
        onPress={() => setCount(count + 1)}
      />
      <PrimaryButton
        label="Override"
        onPress={() => {}}
        style={{ borderRadius: 3 }}
        textStyle={{ fontSize: 19, color: '#123456' }}
      />
      <Eyebrow light>On photo</Eyebrow>
      <AppTabs screen="home" wordBack="results" navigate={() => {}} />
    </>
  );
}

afterEach(async () => {
  if (view) await Renderer.act(async () => view.unmount());
});

const button = (label: string) =>
  view.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
const label = (value: string) =>
  view.root.findAllByType(Text).find(node => node.props.children === value)!;
const background = (value: string) =>
  StyleSheet.flatten(button(value).props.style({ pressed: false }));
const textStyle = (value: string) =>
  StyleSheet.flatten(label(value).props.style);

test('theme updates affect shared styles without remounting screen state', async () => {
  await Renderer.act(async () => {
    view = Renderer.create(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
  });
  const original = background('Count 0');
  expect(original.backgroundColor).toBe('#6B46E5');
  await Renderer.act(async () => button('Count 0').props.onPress());
  expect(background('Count 1')).toEqual(original);

  await Renderer.act(async () =>
    theme.setTheme({ primary: '#FFFFFF', fontScale: 1.2 }),
  );
  expect(background('Count 1').backgroundColor).toBe('#FFFFFF');
  expect(textStyle('Count 1').color).toBe('#000000');
  expect(textStyle('Count 1').fontSize).toBeCloseTo(18);
  expect(textStyle('Trang chủ').color).toBe(theme.colors.primaryText);
  expect(textStyle('On photo').color).toBe('#FFFFFF');

  await Renderer.act(async () => theme.setTheme({ primary: '#123456' }));
  expect(textStyle('Count 1').fontSize).toBeCloseTo(18);
  await Renderer.act(async () => theme.resetTheme());
  expect(textStyle('Count 1').fontSize).toBe(15);
  expect(background('Count 1').backgroundColor).toBe('#6B46E5');
});

test('component overrides stay last while inherited theme values still update', async () => {
  await Renderer.act(async () => {
    view = Renderer.create(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
  });
  await Renderer.act(async () =>
    theme.setTheme({ primary: '#123456', fontScale: 1.2 }),
  );
  expect(background('Override')).toMatchObject({
    backgroundColor: '#123456',
    borderRadius: 3,
  });
  expect(textStyle('Override')).toMatchObject({
    fontSize: 19,
    color: '#123456',
  });
  expect(background('Override').fontSize).toBeUndefined();
});
