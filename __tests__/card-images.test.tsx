import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { CardImage } from '@/components/CardImage';
import { CardPhoto } from '@/components/CardPhoto';
import {
  getCardImage,
  uploadCardImage,
  deleteCardImage,
} from '@/api/endpoints/cardImage';

jest.mock('@/api/endpoints/cardImage', () => ({
  getCardImage: jest.fn(),
  uploadCardImage: jest.fn(),
  deleteCardImage: jest.fn(),
}));
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));
beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(getCardImage)
    .mockResolvedValue({
      image_url: 'https://private.example/fresh',
      has_image: true,
    });
  jest
    .mocked(uploadCardImage)
    .mockResolvedValue({
      image_url: 'https://private.example/uploaded',
      has_image: true,
    });
  jest
    .mocked(deleteCardImage)
    .mockResolvedValue({ image_url: null, has_image: false });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('renders the saved image and refreshes an expired URL once on demand', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <CardImage
        imageUrl="https://private.example/expired"
        cardId="owned-card"
        token="token"
        label="Ảnh của bạn"
      />,
    );
  });
  try {
    expect(getCardImage).not.toHaveBeenCalled();
    expect(renderer.root.findByType(Image).props.source.uri).toBe(
      'https://private.example/expired',
    );
    await ReactTestRenderer.act(async () =>
      renderer.root.findByType(Image).props.onError(),
    );
    expect(getCardImage).toHaveBeenCalledWith('token', 'owned-card');
    expect(renderer.root.findByType(Image).props.source.uri).toBe(
      'https://private.example/fresh',
    );
  } finally {
    await ReactTestRenderer.act(async () => renderer.unmount());
  }
});

test('does not show private images or accept an old refresh response after logout', async () => {
  let resolve!: (result: { image_url: string; has_image: boolean }) => void;
  jest.mocked(getCardImage).mockReturnValueOnce(
    new Promise(done => {
      resolve = done;
    }),
  );
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <CardImage
        imageUrl="https://private.example/expired"
        cardId="owned-card"
        token="old-token"
        label="Private"
      />,
    );
  });
  try {
    await ReactTestRenderer.act(async () =>
      renderer.root.findByType(Image).props.onError(),
    );
    await ReactTestRenderer.act(async () =>
      renderer.update(
        <CardImage
          imageUrl="https://private.example/expired"
          cardId="owned-card"
          token={null}
          label="Private"
        />,
      ),
    );
    await ReactTestRenderer.act(async () =>
      resolve({
        image_url: 'https://private.example/old-owner',
        has_image: true,
      }),
    );
    expect(renderer.root.findAllByType(Image)).toHaveLength(0);
  } finally {
    await ReactTestRenderer.act(async () => renderer.unmount());
  }
});

test('lets the learner attach a photo to an already saved word', async () => {
  jest
    .mocked(launchImageLibrary)
    .mockResolvedValueOnce({
      assets: [{ uri: 'file:///chosen.jpg', type: 'image/jpeg' }],
    });
  const onChanged = jest.fn().mockResolvedValue(undefined);
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <CardPhoto
        cardId="owned"
        token="token"
        term="chair"
        onChanged={onChanged}
        onUnauthorized={jest.fn()}
      />,
    );
  });
  try {
    const button = renderer.root
      .findAllByProps({ accessibilityLabel: 'Thêm ảnh của bạn' })
      .find(node => typeof node.props.onPress === 'function')!;
    await ReactTestRenderer.act(async () => button.props.onPress());
    expect(uploadCardImage).toHaveBeenCalledWith('token', 'owned', {
      uri: 'file:///chosen.jpg',
      type: 'image/jpeg',
    });
    expect(onChanged).toHaveBeenCalledTimes(1);
    expect(renderer.root.findByType(Image).props.source.uri).toBe(
      'https://private.example/uploaded',
    );
  } finally {
    await ReactTestRenderer.act(async () => renderer.unmount());
  }
});

test('does not upload or change the card when photo selection is cancelled', async () => {
  jest.mocked(launchImageLibrary).mockResolvedValueOnce({ didCancel: true });
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  const onChanged = jest.fn();
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <CardPhoto
        cardId="owned"
        token="token"
        term="chair"
        onChanged={onChanged}
        onUnauthorized={jest.fn()}
      />,
    );
  });
  try {
    const button = renderer.root
      .findAllByProps({ accessibilityLabel: 'Thêm ảnh của bạn' })
      .find(node => typeof node.props.onPress === 'function')!;
    await ReactTestRenderer.act(async () => button.props.onPress());
    expect(uploadCardImage).not.toHaveBeenCalled();
    expect(onChanged).not.toHaveBeenCalled();
  } finally {
    await ReactTestRenderer.act(async () => renderer.unmount());
  }
});

test('an old delete confirmation cannot mutate a card after the account changes', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  const props = {
    term: 'chair',
    onChanged: jest.fn(),
    onUnauthorized: jest.fn(),
  };
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <CardPhoto
        {...props}
        cardId="old-card"
        token="old-token"
        imageUrl="https://private.example/old"
        hasImage
      />,
    );
  });
  try {
    const button = renderer.root
      .findAllByProps({ accessibilityLabel: 'Xóa ảnh của thẻ' })
      .find(node => typeof node.props.onPress === 'function')!;
    await ReactTestRenderer.act(async () => button.props.onPress());
    const confirm = jest
      .mocked(Alert.alert)
      .mock.calls.at(-1)?.[2]
      ?.find(item => item.text === 'Xóa ảnh')?.onPress;
    expect(confirm).toBeDefined();
    await ReactTestRenderer.act(async () =>
      renderer.update(
        <CardPhoto {...props} cardId="new-card" token="new-token" />,
      ),
    );
    await ReactTestRenderer.act(async () => confirm?.());
    expect(deleteCardImage).not.toHaveBeenCalled();
  } finally {
    await ReactTestRenderer.act(async () => renderer.unmount());
  }
});

test('deletes only the photo after confirmation and refreshes the saved card', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  const onChanged = jest.fn().mockResolvedValue(undefined);
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <CardPhoto
        cardId="owned"
        token="token"
        term="chair"
        imageUrl="https://private.example/photo"
        hasImage
        onChanged={onChanged}
        onUnauthorized={jest.fn()}
      />,
    );
  });
  try {
    const button = renderer.root
      .findAllByProps({ accessibilityLabel: 'Xóa ảnh của thẻ' })
      .find(node => typeof node.props.onPress === 'function')!;
    await ReactTestRenderer.act(async () => button.props.onPress());
    const confirm = jest
      .mocked(Alert.alert)
      .mock.calls.at(-1)?.[2]
      ?.find(item => item.text === 'Xóa ảnh')?.onPress;
    await ReactTestRenderer.act(async () => confirm?.());
    expect(deleteCardImage).toHaveBeenCalledWith('token', 'owned');
    expect(onChanged).toHaveBeenCalledTimes(1);
    expect(renderer.root.findAllByType(Image)).toHaveLength(0);
  } finally {
    await ReactTestRenderer.act(async () => renderer.unmount());
  }
});
