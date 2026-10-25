import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useScanFlow } from '@/app/hooks/useScanFlow';
import { Image, StyleSheet } from 'react-native';
import { CropPreview, containRect } from '@/components/ObjectPicker';
import type { DetectedObject, ScanResult } from '@/api/contracts';
const mockScanImage = jest.fn();
const mockSelect = jest.fn();
jest.mock('@/api/endpoints/scanImage', () => ({
  scanImage: (...args: unknown[]) => mockScanImage(...args),
  selectScanObject: (...args: unknown[]) => mockSelect(...args),
}));
const box = { left: 0.2, top: 0.2, width: 0.3, height: 0.4 };
const item: DetectedObject = {
  object_id: 'cup-2',
  selection_token: 'signed-cup',
  keyword: 'Cup',
  confidence: 98,
  bounding_box: box,
  categories: [],
  parents: [],
  aliases: [],
};
const first: ScanResult = {
  status: 'OK',
  keyword: 'book',
  pronunciation: null,
  meaning_vi: 'sách',
  example_1: 'A book.',
  example_2: 'My book.',
  related_words: [],
  aliases: [],
  parents: [],
  categories: [],
  audio_base64: null,
  confidence: 98,
  detected_objects: [item],
  bounding_box: box,
  source: 'mongodb',
  is_draft: false,
  message: null,
  selected_object_id: 'book-1',
};
const chosen: ScanResult = {
  ...first,
  keyword: 'cup',
  meaning_vi: 'cốc',
  selected_object_id: 'cup-2',
  detected_objects: [],
};
beforeEach(() => jest.clearAllMocks());
async function mount() {
  let flow!: ReturnType<typeof useScanFlow>;
  const Harness = ({ token }: { token: string }) => {
    flow = useScanFlow({
      token,
      navigate: jest.fn(),
      onUnauthorized: jest.fn(),
      reloadUser: jest.fn().mockResolvedValue(undefined),
      sceneId: 'desk',
      setSceneId: jest.fn(),
    });
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  mockScanImage.mockResolvedValue(first);
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Harness token="token" />);
  });
  await ReactTestRenderer.act(async () => {
    flow.selectImage({ uri: 'file:///scene.png' });
  });
  await ReactTestRenderer.act(async () => {
    await flow.scan();
  });
  return { get: () => flow, renderer, Harness };
}
test('selects a second region without rescanning and retains the complete object list', async () => {
  const h = await mount();
  mockSelect.mockResolvedValue(chosen);
  try {
    await ReactTestRenderer.act(async () => {
      await h.get().selectObject(item);
    });
    expect(mockSelect).toHaveBeenCalledWith('token', 'signed-cup');
    expect(mockScanImage).toHaveBeenCalledTimes(1);
    expect(h.get().scanResult?.keyword).toBe('cup');
    expect(h.get().scanResult?.detected_objects).toEqual([item]);
    expect(h.get().scanResult?.bounding_box).toEqual(box);
  } finally {
    await ReactTestRenderer.act(async () => h.renderer.unmount());
  }
});
test.each(['image', 'session'])(
  'ignores late selection after %s changes',
  async change => {
    const h = await mount();
    let resolve!: (v: ScanResult) => void;
    mockSelect.mockReturnValue(
      new Promise<ScanResult>(done => {
        resolve = done;
      }),
    );
    let pending!: Promise<void>;
    try {
      await ReactTestRenderer.act(async () => {
        pending = h.get().selectObject(item);
      });
      await ReactTestRenderer.act(async () => {
        if (change === 'image')
          h.get().selectImage({ uri: 'file:///different.jpg' });
        else h.renderer.update(<h.Harness token="new-token" />);
      });
      await ReactTestRenderer.act(async () => {
        resolve(chosen);
        await pending;
      });
      expect(h.get().scanResult?.keyword).not.toBe('cup');
    } finally {
      await ReactTestRenderer.act(async () => h.renderer.unmount());
    }
  },
);
test('positions boxes on the contained image including letterboxing', () => {
  expect(containRect(300, 300, 600, 300)).toEqual({
    left: 0,
    top: 75,
    width: 300,
    height: 150,
  });
  expect(containRect(300, 300, 300, 600)).toEqual({
    left: 75,
    top: 0,
    width: 150,
    height: 300,
  });
});

test('clips a tall crop inside its fitted window so adjacent objects cannot show through', async () => {
  const getSize = jest
    .spyOn(Image, 'getSize')
    .mockImplementation((_uri, success) => success(600, 300));
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  try {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <CropPreview
          uri="file:///scene.png"
          box={{ left: 0.1, top: 0.1, width: 0.1, height: 0.8 }}
        />,
      );
    });
    const layout = renderer.root.findAll(
      node => typeof node.props.onLayout === 'function',
    )[0];
    await ReactTestRenderer.act(async () =>
      layout.props.onLayout({ nativeEvent: { layout: { width: 300 } } }),
    );
    const frame = renderer.root.findByProps({ testID: 'crop-window' });
    expect(StyleSheet.flatten(frame.props.style)).toEqual(
      expect.objectContaining({ overflow: 'hidden', width: 42.5, height: 170 }),
    );
  } finally {
    if (renderer) await ReactTestRenderer.act(async () => renderer.unmount());
    getSize.mockRestore();
  }
});

const book: DetectedObject = {
  ...item,
  object_id: 'book-1',
  selection_token: 'signed-book',
  keyword: 'Book',
};

test('A → B → A → B reuses results without another API call', async () => {
  const h = await mount();
  mockSelect.mockResolvedValue(chosen);
  try {
    for (const object of [item, book, item]) {
      await ReactTestRenderer.act(async () => h.get().selectObject(object));
    }
    expect(h.get().scanResult?.keyword).toBe('cup');
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockScanImage).toHaveBeenCalledTimes(1);
  } finally {
    await ReactTestRenderer.act(async () => h.renderer.unmount());
  }
});

test('selection cache expires after five minutes', async () => {
  let now = 1000;
  const clock = jest.spyOn(Date, 'now').mockImplementation(() => now);
  const h = await mount();
  mockSelect.mockResolvedValue(chosen);
  try {
    await ReactTestRenderer.act(async () => h.get().selectObject(item));
    now += 5 * 60_000 + 1;
    mockSelect.mockResolvedValue(first);
    await ReactTestRenderer.act(async () => h.get().selectObject(book));
    expect(mockSelect).toHaveBeenCalledTimes(2);
  } finally {
    clock.mockRestore();
    await ReactTestRenderer.act(async () => h.renderer.unmount());
  }
});

test('changing the account drops cached object results', async () => {
  const h = await mount();
  mockSelect.mockResolvedValue(chosen);
  try {
    await ReactTestRenderer.act(async () => h.get().selectObject(item));
    await ReactTestRenderer.act(async () =>
      h.renderer.update(<h.Harness token="other" />),
    );
    mockSelect.mockResolvedValue(first);
    await ReactTestRenderer.act(async () => h.get().selectObject(book));
    expect(mockSelect).toHaveBeenLastCalledWith('other', 'signed-book');
    expect(mockSelect).toHaveBeenCalledTimes(2);
  } finally {
    await ReactTestRenderer.act(async () => h.renderer.unmount());
  }
});

test('opening history does not extend the original cached result lifetime', async () => {
  let now = 1000;
  const clock = jest.spyOn(Date, 'now').mockImplementation(() => now);
  const h = await mount();
  mockSelect.mockResolvedValue(chosen);
  try {
    now += 4 * 60_000;
    await ReactTestRenderer.act(async () =>
      h.get().openHistory(h.get().history[0]),
    );
    await ReactTestRenderer.act(async () => h.get().selectObject(item));
    now += 2 * 60_000;
    mockSelect.mockResolvedValue(first);
    await ReactTestRenderer.act(async () => h.get().selectObject(book));
    expect(mockSelect).toHaveBeenCalledTimes(2);
  } finally {
    clock.mockRestore();
    await ReactTestRenderer.act(async () => h.renderer.unmount());
  }
});

test('a new scan cannot reuse selections from the previous image', async () => {
  const h = await mount();
  mockSelect.mockResolvedValue(chosen);
  try {
    await ReactTestRenderer.act(async () => h.get().selectObject(item));
    await ReactTestRenderer.act(async () =>
      h.get().selectImage({ uri: 'file:///other.jpg' }),
    );
    await ReactTestRenderer.act(async () => h.get().scan());
    await ReactTestRenderer.act(async () => h.get().selectObject(item));
    expect(mockSelect).toHaveBeenCalledTimes(2);
  } finally {
    await ReactTestRenderer.act(async () => h.renderer.unmount());
  }
});
