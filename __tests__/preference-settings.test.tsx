import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ProfileScreen } from '@/screens/account/ProfileScreen';
import type { ScreenProps } from '@/types/screen';

jest.mock('lucide-react-native');
test('profile offers only the choices supplied by backend and saves the selected user setting', async () => {
  const change = jest.fn();
  const speed = jest.fn();
  const props = {
    navigate: jest.fn(),
    totalSaved: 0,
    history: [],
    preferencesBusy: false,
    onPreferencesChange: change,
    onVoiceSpeedChange: speed,
    user: {
      id: 'learner',
      username: 'learner',
      preferences: {
        voice_speed: 1,
        daily_review_goal: 15,
        max_detected_objects: 10,
      },
      scan_settings: {
        max_detected_objects: 8,
        max_allowed_objects: 8,
        confidence_threshold: 0.7,
      },
      preference_limits: {
        allowed_speeds: [1, 1.25],
        max_daily_review_goal: 20,
      },
    },
  } as unknown as ScreenProps;
  let renderer!: Renderer.ReactTestRenderer;
  await act(async () => {
    renderer = Renderer.create(<ProfileScreen {...props} />);
  });
  const labels = renderer.root.findAll(
    item =>
      typeof item.props.onPress === 'function' &&
      typeof item.props.accessibilityLabel === 'string',
  );
  expect(
    labels.some(item => item.props.accessibilityLabel.includes('0.75x')),
  ).toBe(false);
  expect(
    labels.some(item => item.props.accessibilityLabel === 'Số vật mỗi ảnh: 9'),
  ).toBe(false);
  expect(
    labels.some(
      item => item.props.accessibilityLabel === 'Mục tiêu ôn mỗi ngày (từ): 30',
    ),
  ).toBe(false);
  await act(async () => {
    labels
      .find(item => item.props.accessibilityLabel === 'Số vật mỗi ảnh: 6')!
      .props.onPress();
    labels
      .find(
        item =>
          item.props.accessibilityLabel === 'Mục tiêu ôn mỗi ngày (từ): 20',
      )!
      .props.onPress();
    labels
      .find(item => item.props.accessibilityLabel.endsWith('1.25x'))!
      .props.onPress();
  });
  expect(change).toHaveBeenCalledWith({ max_detected_objects: 6 });
  expect(change).toHaveBeenCalledWith({ daily_review_goal: 20 });
  expect(speed).toHaveBeenCalledWith(1.25);
  await act(async () => {
    renderer.unmount();
  });
});
