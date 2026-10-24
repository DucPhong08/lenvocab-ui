import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import { ApiError } from '@/api/client/ApiError';
import type { Flashcard, ScanResult } from '@/api/contracts';
import { confirmFlashcard } from '@/api/endpoints/confirmFlashcard';
import { useVocabularyLibrary } from '@/app/hooks/useVocabularyLibrary';

jest.mock('@/api/endpoints/confirmFlashcard', () => ({
  confirmFlashcard: jest.fn(),
}));

const draft: ScanResult = {
  status: 'OK',
  keyword: 'mug',
  pronunciation: null,
  meaning_vi: 'cốc',
  example_1: 'A mug.',
  example_2: 'My mug.',
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
const card: Flashcard = {
  user_flashcard_id: 'mug-card',
  global_flashcard_id: 'mug-global',
  keyword: 'mug',
  pronunciation: null,
  meaning_vi: 'cốc',
  example_1: 'A mug.',
  example_2: 'My mug.',
  related_words: [],
  audio_base64: null,
  status: 'CONFIRMED',
  interval: 1,
  repetitions: 0,
  efactor: 2.5,
  next_review_date: '2026-10-25',
};

async function mountLibrary(
  overrides: Partial<Parameters<typeof useVocabularyLibrary>[0]> = {},
) {
  const options = {
    cards: [],
    requestSignIn: jest.fn(),
    onUnauthorized: jest.fn(),
    reloadCards: jest.fn().mockResolvedValue([]),
    reloadDue: jest.fn().mockResolvedValue([]),
    scanResult: draft,
    showFeedback: jest.fn(),
    token: 'user-token',
    ...overrides,
  };
  let library!: ReturnType<typeof useVocabularyLibrary>;
  const Harness = ({ token }: { token: string | null }) => {
    library = useVocabularyLibrary({ ...options, token });
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Harness token={options.token} />);
  });
  return {
    renderer,
    options,
    Harness,
    get library() {
      return library;
    },
  };
}

beforeEach(() => {
  jest.mocked(confirmFlashcard).mockReset().mockResolvedValue(card);
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('blocks two rapid save taps before React renders the busy state', async () => {
  let resolveSave!: (value: Flashcard) => void;
  jest.mocked(confirmFlashcard).mockReturnValue(
    new Promise(resolve => {
      resolveSave = resolve;
    }),
  );
  const state = await mountLibrary();
  try {
    await ReactTestRenderer.act(async () => {
      const first = state.library.toggleSaved('scan:mug');
      const second = state.library.toggleSaved('scan:mug');
      expect(confirmFlashcard).toHaveBeenCalledTimes(1);
      resolveSave(card);
      await Promise.all([first, second]);
    });
    expect(state.library.saving).toBe(false);
    expect(state.options.showFeedback).toHaveBeenCalledWith(
      'Đã lưu từ vào tài khoản của bạn.',
    );
  } finally {
    await ReactTestRenderer.act(async () => state.renderer.unmount());
  }
});

test('reports successful storage separately from a failed library refresh', async () => {
  const state = await mountLibrary({
    reloadCards: jest.fn().mockRejectedValue(new Error('offline')),
  });
  try {
    await ReactTestRenderer.act(async () =>
      state.library.toggleSaved('scan:mug'),
    );
    expect(confirmFlashcard).toHaveBeenCalledTimes(1);
    expect(state.options.showFeedback).toHaveBeenCalledWith(
      'Đã lưu từ. Chưa thể cập nhật kho học; vui lòng tải lại.',
    );
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(state.library.saving).toBe(false);
  } finally {
    await ReactTestRenderer.act(async () => state.renderer.unmount());
  }
});

test('shows an expired draft error and allows another save attempt', async () => {
  jest
    .mocked(confirmFlashcard)
    .mockRejectedValueOnce(
      new ApiError('Thẻ nháp đã hết hạn. Vui lòng quét lại ảnh.', 409),
    );
  const state = await mountLibrary();
  try {
    await ReactTestRenderer.act(async () =>
      state.library.toggleSaved('scan:mug'),
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      'Không thể lưu từ',
      'Thẻ nháp đã hết hạn. Vui lòng quét lại ảnh.',
    );
    expect(state.options.showFeedback).not.toHaveBeenCalled();
    expect(state.options.reloadCards).not.toHaveBeenCalled();
    expect(state.library.saving).toBe(false);
    await ReactTestRenderer.act(async () =>
      state.library.toggleSaved('scan:mug'),
    );
    expect(confirmFlashcard).toHaveBeenCalledTimes(2);
  } finally {
    await ReactTestRenderer.act(async () => state.renderer.unmount());
  }
});

test('ignores a save result after the account session changes', async () => {
  let resolveSave!: (value: Flashcard) => void;
  jest.mocked(confirmFlashcard).mockReturnValue(
    new Promise(resolve => {
      resolveSave = resolve;
    }),
  );
  const state = await mountLibrary();
  try {
    let pending!: Promise<void>;
    await ReactTestRenderer.act(async () => {
      pending = state.library.toggleSaved('scan:mug');
    });
    await ReactTestRenderer.act(async () => {
      state.renderer.update(<state.Harness token="other-user-token" />);
    });
    await ReactTestRenderer.act(async () => {
      resolveSave(card);
      await pending;
    });
    expect(state.options.showFeedback).not.toHaveBeenCalled();
    expect(state.options.reloadCards).not.toHaveBeenCalled();
    expect(state.options.reloadDue).not.toHaveBeenCalled();
  } finally {
    await ReactTestRenderer.act(async () => state.renderer.unmount());
  }
});

test('opens a due card even when its saved-library page has not been loaded', async () => {
  const state = await mountLibrary({
    cards: [],
    due: [{ ...card, keyword: 'keyboard' }],
  });
  try {
    expect(state.library.wordForId(card.user_flashcard_id).term).toBe(
      'keyboard',
    );
    expect(state.library.saved).toContain(card.user_flashcard_id);
  } finally {
    await ReactTestRenderer.act(async () => state.renderer.unmount());
  }
});
