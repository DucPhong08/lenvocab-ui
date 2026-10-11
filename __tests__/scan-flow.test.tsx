import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ApiError } from '@/api/client/ApiError';
import type { ScanResult } from '@/api/contracts';
import { useScanFlow } from '@/app/hooks/useScanFlow';

const mockScanImage = jest.fn();
jest.mock('@/api/endpoints/scanImage', () => ({
  scanImage: (...args: unknown[]) => mockScanImage(...args),
}));

const result: ScanResult = {
  status: 'OK',
  keyword: 'chair',
  pronunciation: null,
  meaning_vi: 'cái ghế',
  example_1: 'This is a chair.',
  example_2: 'The chair is blue.',
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
};

test.each<[string | null, string | null]>([
  ['old-token', null],
  [null, 'new-token'],
])('discards a pending scan when the session changes from %s to %s', async (before, after) => {
  let resolveScan!: (value: ScanResult) => void;
  mockScanImage.mockReturnValue(
    new Promise<ScanResult>(resolve => {
      resolveScan = resolve;
    }),
  );
  const navigate = jest.fn();
  let flow!: ReturnType<typeof useScanFlow>;
  const Harness = ({ token }: { token: string | null }) => {
    flow = useScanFlow({
      navigate,
      onUnauthorized: jest.fn(),
      reloadUser: jest.fn(),
      sceneId: 'desk',
      setSceneId: jest.fn(),
      token,
    });
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Harness token={before} />);
  });
  await ReactTestRenderer.act(async () => {
    flow.selectImage({ uri: 'file:///chair.jpg' });
  });
  let pending!: Promise<void>;
  await ReactTestRenderer.act(async () => {
    pending = flow.scan();
    renderer.update(<Harness token={after} />);
  });
  await ReactTestRenderer.act(async () => {
    resolveScan(result);
    await pending;
  });

  expect(flow.scanResult).toBeNull();
  expect(flow.history).toEqual([]);
  expect(flow.scanning).toBe(false);
  expect(navigate).not.toHaveBeenCalled();
  await ReactTestRenderer.act(async () => renderer.unmount());
});

test('uses the shared unauthorized callback for scan mutations', async () => {
  mockScanImage.mockRejectedValue(new ApiError('expired', 401));
  const onUnauthorized = jest.fn().mockResolvedValue(undefined);
  let flow!: ReturnType<typeof useScanFlow>;
  const Harness = () => {
    flow = useScanFlow({
      navigate: jest.fn(),
      onUnauthorized,
      reloadUser: jest.fn(),
      sceneId: 'desk',
      setSceneId: jest.fn(),
      token: 'expired-token',
    });
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Harness />);
  });
  await ReactTestRenderer.act(async () => {
    flow.selectImage({ uri: 'file:///chair.jpg' });
  });
  await ReactTestRenderer.act(async () => flow.scan());

  expect(onUnauthorized).toHaveBeenCalledTimes(1);
  await ReactTestRenderer.act(async () => renderer.unmount());
});
