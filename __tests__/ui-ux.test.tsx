import React from 'react';
import Renderer from 'react-test-renderer';
import { Text } from 'react-native';
import { ResultsScreen } from '@/screens/discover/ResultsScreen';
import { cardWord } from '@/api/mappers/cardWord';
import { HomeScreen } from '@/screens/discover/HomeScreen';
import { WordScreen } from '@/screens/discover/WordScreen';
import { SavedScreen } from '@/screens/learn/SavedScreen';
import { FlashcardsScreen } from '@/screens/learn/FlashcardsScreen';
import { ReviewScreen } from '@/screens/learn/ReviewScreen';
import { ProfileScreen } from '@/screens/account/ProfileScreen';
import { AppTabs } from '@/app/AppTabs';
import { getWord } from '@/data/getWord';
import type { ScreenProps } from '@/types/screen';
import type { Flashcard } from '@/api/contracts';

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  const mockReact = require('react');
  return new Proxy(
    {},
    {
      get: (_target, key) =>
        key === '__esModule' ? true : () => mockReact.createElement(View),
    },
  );
});
const mockPlay = jest.fn();
jest.mock('@/hooks/useAudio', () => ({
  useAudio: () => ({ play: mockPlay, isPlaying: false }),
}));
jest.mock('@react-native-community/image-editor', () => ({
  __esModule: true,
  default: { cropImage: jest.fn() },
}));
jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/tmp',
  read: jest.fn(),
  unlink: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

const card: Flashcard = {
  user_flashcard_id: 'personal-cup',
  global_flashcard_id: 'global-cup',
  keyword: 'my cup',
  pronunciation: '/kʌp/',
  meaning_vi: 'cốc của tôi',
  example_1: 'My cup.',
  example_2: 'A cup.',
  related_words: [],
  audio_base64: null,
  status: 'CONFIRMED',
  interval: 1,
  repetitions: 0,
  efactor: 2.5,
  next_review_date: '2026-10-26',
};

function props(overrides: Partial<ScreenProps> = {}): ScreenProps {
  return {
    navigate: jest.fn(),
    cards: [],
    due: [],
    saved: [],
    totalSaved: 0,
    history: [],
    user: null,
    token: null,
    wordId: 'notebook',
    sceneId: 'desk',
    wordBack: 'results',
    wordForId: getWord,
    toggleSaved: jest.fn(),
    openWord: jest.fn(),
    setSceneId: jest.fn(),
    selectImage: jest.fn(),
    reloadData: jest.fn().mockResolvedValue(undefined),
    loadMoreCards: jest.fn().mockResolvedValue(undefined),
    hasMoreCards: false,
    loadingData: false,
    dataError: null,
    loadingMoreCards: false,
    saving: false,
    ...overrides,
  } as unknown as ScreenProps;
}

let view: Renderer.ReactTestRenderer;
afterEach(async () => {
  if (view) await Renderer.act(async () => view.unmount());
});
async function mount(element: React.ReactElement) {
  await Renderer.act(async () => {
    view = Renderer.create(element);
  });
}
function text() {
  return view.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat()
    .join(' ');
}
function button(label: string) {
  const node = view.root.findAll(
    item =>
      item.props.accessibilityLabel === label &&
      typeof item.props.onPress === 'function',
  )[0];
  if (!node) throw new Error(`Missing action: ${label}`);
  return node;
}

test('home shows personal vocabulary instead of static sample words after login', async () => {
  await mount(
    <HomeScreen
      {...props({
        user: {
          id: 'u',
          username: 'phong',
          daily_quota_left: 10,
        } as ScreenProps['user'],
        cards: [card],
      })}
    />,
  );
  expect(text()).toContain('my cup');
  expect(
    view.root.findAll(node => node.props.accessibilityLabel === 'Lưu notebook'),
  ).toHaveLength(0);
  expect(text()).not.toContain('Khám phá từ mẫu');
});

test('sample word opens capture even if another scan is still present', async () => {
  const data = props({
    scanResult: { keyword: 'cup' } as ScreenProps['scanResult'],
  });
  await mount(<WordScreen {...data} />);
  await Renderer.act(async () =>
    button('Chụp ảnh để tạo thẻ của bạn').props.onPress(),
  );
  expect(data.navigate).toHaveBeenCalledWith('camera');
  expect(data.toggleSaved).not.toHaveBeenCalled();
});

test('sample source switches to the actual source scene and clears an old photo', async () => {
  const data = props({ wordId: 'kettle', sceneId: 'desk' });
  await mount(<WordScreen {...data} />);
  const source = button('Xem cảnh Trong căn bếp');
  expect(source).toBeDefined();
  await Renderer.act(async () => source.props.onPress());
  expect(data.setSceneId).toHaveBeenCalledWith('kitchen');
  expect(data.selectImage).toHaveBeenCalledWith(null);
  expect(data.navigate).toHaveBeenCalledWith('results');
});

test('empty search resets the query instead of taking the learner to capture', async () => {
  const data = props({
    cards: [card],
    saved: ['personal-cup'],
    totalSaved: 1,
    user: { id: 'u' } as ScreenProps['user'],
  });
  await mount(<SavedScreen {...data} />);
  await Renderer.act(async () => button('Tìm kiếm và lọc từ').props.onPress());
  const input = view.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Tìm từ vựng' &&
      node.props.onChangeText,
  )[0];
  await Renderer.act(async () => input.props.onChangeText('missing'));
  await Renderer.act(async () =>
    button('Xóa tìm kiếm và bộ lọc').props.onPress(),
  );
  expect(text()).toContain('my cup');
  expect(input.props.value).toBe('');
  expect(data.navigate).not.toHaveBeenCalled();
});

test('flashcards show loading rather than claiming the review is complete', async () => {
  await mount(
    <FlashcardsScreen
      {...props({
        user: { id: 'u' } as ScreenProps['user'],
        loadingData: true,
      })}
    />,
  );
  expect(text()).toContain('Đang tải thẻ ôn tập');
  expect(text()).not.toContain('Chưa có từ cần ôn');
  expect(text()).not.toContain('Bạn đã ôn hết');
});

test('signed-in profile has no identity button that does nothing', async () => {
  await mount(
    <ProfileScreen
      {...props({
        user: {
          id: 'u',
          username: 'phong',
          preferences: {},
        } as ScreenProps['user'],
      })}
    />,
  );
  expect(
    view.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Xem trạng thái tài khoản' &&
        node.props.onPress,
    ),
  ).toHaveLength(0);
});

test.each([
  ['results', 'Quét ảnh'],
  ['flashcards', 'Ôn tập'],
  ['history', 'Quét ảnh'],
] as const)('word from %s retains its parent tab', async (parent, label) => {
  await mount(<AppTabs screen="word" wordBack={parent} navigate={jest.fn()} />);
  expect(button(label).props.accessibilityState.selected).toBe(true);
});

test('a newly saved card can enter review before the server count catches up', async () => {
  await mount(
    <ReviewScreen
      {...props({
        user: { id: 'u' } as ScreenProps['user'],
        cards: [card],
        due: [card],
        totalSaved: 0,
      })}
    />,
  );
  expect(button('Ôn nhanh 1 từ').props.disabled).toBe(false);
  expect(text()).not.toContain('Chưa có từ để luyện tập');
});

test('finishing today disables an empty flashcard session while quiz stays available', async () => {
  await mount(
    <ReviewScreen
      {...props({
        user: { id: 'u' } as ScreenProps['user'],
        cards: [card],
        totalSaved: 100,
      })}
    />,
  );
  expect(button('Hôm nay chưa cần ôn').props.disabled).toBe(true);
  expect(button('Quiz nhanh')).toBeDefined();
});

const partialSave = () =>
  props({
    token: 'token',
    user: { id: 'u' } as ScreenProps['user'],
    imageUri: 'file:///scene.jpg',
    cards: [card],
    saved: [card.user_flashcard_id],
    wordId: 'scan:my cup',
    wordForId: () => cardWord(card),
    currentScanSaved: false,
    scanResult: {
      keyword: 'my cup',
      selected_object_id: 'cup-1',
      bounding_box: null,
      detected_objects: [
        {
          keyword: 'my cup',
          object_id: 'cup-1',
          selection_token: 'selection',
          bounding_box: { left: 0, top: 0, width: 1, height: 1 },
        },
      ],
    } as ScreenProps['scanResult'],
    selectObject: jest.fn(),
  });

test('results retry sticker upload using the scan id after the word was already saved', async () => {
  const data = partialSave();
  await mount(<ResultsScreen {...data} />);
  await Renderer.act(async () =>
    button('Đổi sticker của thẻ đã lưu').props.onPress(),
  );
  expect(data.toggleSaved).toHaveBeenCalledWith('scan:my cup');
});

test('word details can retry the current scan after only the word was saved', async () => {
  const data = partialSave();
  await mount(<WordScreen {...data} />);
  await Renderer.act(async () =>
    button('Đổi sticker của thẻ đã lưu').props.onPress(),
  );
  expect(data.toggleSaved).toHaveBeenCalledWith('scan:my cup');
});

test('flashcards recover after an initial fetch error instead of retaining an empty queue', async () => {
  const data = props({
    user: { id: 'u' } as ScreenProps['user'],
    dataError: 'offline',
  });
  await mount(<FlashcardsScreen {...data} />);
  await Renderer.act(async () =>
    view.update(<FlashcardsScreen {...data} dataError={null} due={[card]} />),
  );
  expect(button('Xem nghĩa')).toBeDefined();
});

test('meaning reveal stays silent and manual audio plays on demand', async () => {
  mockPlay.mockClear();
  await mount(
    <FlashcardsScreen
      {...props({ user: { id: 'u' } as ScreenProps['user'], due: [card] })}
    />,
  );
  expect(
    view.root.findAll(node => node.props.accessibilityLabel === 'Nhớ rõ'),
  ).toHaveLength(0);
  await Renderer.act(async () => button('Xem nghĩa').props.onPress());
  expect(mockPlay).not.toHaveBeenCalled();
  expect(button('Nhớ rõ')).toBeDefined();
  await Renderer.act(async () =>
    button('Nghe phát âm').props.onPress({ stopPropagation: jest.fn() }),
  );
  expect(mockPlay).toHaveBeenCalledWith(null, 'personal-cup');
});

test('closing search clears invisible filters and restores the grid', async () => {
  await mount(
    <SavedScreen
      {...props({
        cards: [card],
        totalSaved: 1,
        user: { id: 'u' } as ScreenProps['user'],
      })}
    />,
  );
  expect(
    view.root.findAll(node => node.props.accessibilityLabel === 'Tìm từ vựng'),
  ).toHaveLength(0);
  await Renderer.act(async () => button('Tìm kiếm và lọc từ').props.onPress());
  const input = view.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Tìm từ vựng' &&
      node.props.onChangeText,
  )[0];
  await Renderer.act(async () => input.props.onChangeText('missing'));
  expect(text()).toContain('Không tìm thấy từ phù hợp');
  await Renderer.act(async () => button('Đóng tìm kiếm').props.onPress());
  expect(text()).toContain('my cup');
  expect(
    view.root.findAll(node => node.props.accessibilityLabel === 'Tìm từ vựng'),
  ).toHaveLength(0);
});
