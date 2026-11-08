import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import RNFS from 'react-native-fs';
import {
  getLocale,
  I18nProvider,
  setLocale,
  useI18n,
  type I18nContextType,
  type Language,
} from '@/i18n';

jest.mock('react-native-fs');

const files = (RNFS as unknown as { __files: Map<string, string> }).__files;
const path = `${RNFS.DocumentDirectoryPath}/lenvocab-locale.txt`;
let renderer: Renderer.ReactTestRenderer | undefined;
let locale!: I18nContextType;

function Harness() {
  locale = useI18n();
  return null;
}

async function mount(initialLocale?: Language) {
  await act(async () => {
    renderer = Renderer.create(
      <I18nProvider initialLocale={initialLocale}>
        <Harness />
      </I18nProvider>,
    );
  });
}

beforeEach(() => {
  files.clear();
  jest.clearAllMocks();
  jest.mocked(RNFS.readFile).mockReset().mockImplementation(async file => {
    if (!files.has(file)) throw new Error('missing');
    return files.get(file)!;
  });
  jest.mocked(RNFS.writeFile).mockReset().mockImplementation(async (file, content) => {
    files.set(file, content);
  });
  setLocale('vi');
});

afterEach(async () => {
  await act(async () => renderer?.unmount());
  renderer = undefined;
});

test('restores the chosen language after the provider remounts', async () => {
  await mount();
  await act(async () => locale.setLocale('en'));
  expect(files.get(path)).toBe('en');
  await act(async () => renderer!.unmount());
  await mount();
  expect(locale.locale).toBe('en');
  expect(locale.strings.common.back).toBe('Back');
  expect(getLocale()).toBe('en');
});

test.each(['fr', '{broken', '', 'EN'])('ignores invalid saved locale %j', async value => {
  files.set(path, value);
  await mount();
  expect(locale.locale).toBe('vi');
  expect(getLocale()).toBe('vi');
});

test('still opens with Vietnamese if reading the locale fails', async () => {
  jest.mocked(RNFS.readFile).mockRejectedValueOnce(new Error('disk error'));
  await mount();
  expect(locale.locale).toBe('vi');
  await act(async () => locale.setLocale('en'));
  expect(locale.locale).toBe('en');
});

test('an explicit initialLocale overrides the file without a background restore', async () => {
  files.set(path, 'vi');
  await mount('en');
  expect(RNFS.readFile).not.toHaveBeenCalled();
  expect(locale.locale).toBe('en');
  expect(getLocale()).toBe('en');
});

test('a late file read cannot replace a choice made by the user', async () => {
  let finishRead!: (value: string) => void;
  jest.mocked(RNFS.readFile).mockReturnValueOnce(
    new Promise(resolve => { finishRead = resolve; }),
  );
  await mount();
  await act(async () => locale.setLocale('en'));
  await act(async () => finishRead('vi'));
  expect(locale.locale).toBe('en');
  expect(getLocale()).toBe('en');
  expect(files.get(path)).toBe('en');
});

test('serializes consecutive writes and restores the last choice on remount', async () => {
  let finishWrite!: () => void;
  jest.mocked(RNFS.writeFile).mockImplementationOnce((file, content) =>
    new Promise(resolve => {
      finishWrite = () => { files.set(file, content); resolve(); };
    }),
  );
  await mount();
  await act(async () => locale.setLocale('en'));
  await act(async () => locale.setLocale('vi'));
  expect(locale.locale).toBe('vi');
  expect(RNFS.writeFile).toHaveBeenCalledTimes(1);
  await act(async () => finishWrite());
  expect(RNFS.writeFile).toHaveBeenCalledTimes(2);
  expect(files.get(path)).toBe('vi');
  await act(async () => renderer!.unmount());
  await mount();
  expect(locale.locale).toBe('vi');
});

test('a failed write does not break the UI or block a later choice', async () => {
  jest.mocked(RNFS.writeFile).mockRejectedValueOnce(new Error('disk full'));
  await mount();
  await act(async () => locale.setLocale('en'));
  expect(locale.locale).toBe('en');
  await act(async () => locale.setLocale('vi'));
  expect(files.get(path)).toBe('vi');
});

test('a remount waits for an earlier pending write before restoring the locale', async () => {
  let finishWrite!: () => void;
  jest.mocked(RNFS.writeFile).mockImplementationOnce((file, content) =>
    new Promise(resolve => {
      finishWrite = () => { files.set(file, content); resolve(); };
    }),
  );
  await mount();
  await act(async () => locale.setLocale('en'));
  await act(async () => renderer!.unmount());
  await mount();
  expect(RNFS.readFile).toHaveBeenCalledTimes(1);
  await act(async () => finishWrite());
  expect(RNFS.readFile).toHaveBeenCalledTimes(2);
  expect(locale.locale).toBe('en');
});
