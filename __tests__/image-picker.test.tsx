import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useImagePicker } from '@/screens/discover/hooks/useImagePicker';
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));
beforeEach(() => jest.clearAllMocks());
test.each(['camera', 'library'] as const)(
  'bounds %s input to 1600 pixels while keeping its aspect ratio',
  async source => {
    const select = jest.fn();
    let pick!: ReturnType<typeof useImagePicker>;
    const Harness = () => {
      pick = useImagePicker(select);
      return null;
    };
    const asset = {
      uri: 'file:///resized.jpg',
      type: 'image/jpeg',
      width: 1600,
      height: 1200,
    };
    const launch = source === 'camera' ? launchCamera : launchImageLibrary;
    jest.mocked(launch).mockResolvedValue({ assets: [asset] });
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<Harness />);
    });
    try {
      await ReactTestRenderer.act(async () => pick(source));
      expect(launch).toHaveBeenCalledWith(
        expect.objectContaining({
          maxWidth: 1600,
          maxHeight: 1600,
          quality: 0.8,
        }),
      );
      expect(select).toHaveBeenCalledWith(asset);
    } finally {
      await ReactTestRenderer.act(async () => renderer.unmount());
    }
  },
);
