import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Switch } from 'react-native';
import { ProfileScreen } from '@/screens/account/ProfileScreen';
import type { ScreenProps } from '@/types/screen';

jest.mock('lucide-react-native');
test('effect switches send account settings and require server support and a connection', async () => {
  const change = jest.fn();
  const props = {
    navigate: jest.fn(),
    totalSaved: 0,
    history: [],
    preferencesBusy: false,
    onPreferencesChange: change,
    onVoiceSpeedChange: jest.fn(),
    user: {
      username: 'learner',
      preferences: { animations_enabled: true, sound_effects_enabled: false },
    },
  } as unknown as ScreenProps;
  let renderer!: Renderer.ReactTestRenderer;
  await act(async () => {
    renderer = Renderer.create(<ProfileScreen {...props} />);
  });
  const switches = () => renderer.root.findAllByType(Switch);
  expect(switches().map(item => item.props.value)).toEqual([true, false]);
  await act(async () => {
    switches()[0].props.onValueChange(false);
    switches()[1].props.onValueChange(true);
  });
  expect(change).toHaveBeenCalledWith({ animations_enabled: false });
  expect(change).toHaveBeenCalledWith({ sound_effects_enabled: true });
  await act(async () => renderer.update(<ProfileScreen {...props} offline />));
  expect(switches().every(item => item.props.disabled)).toBe(true);
  await act(async () =>
    renderer.update(
      <ProfileScreen
        {...props}
        user={{ ...props.user!, preferences: {} as never }}
      />,
    ),
  );
  expect(switches().every(item => item.props.disabled)).toBe(true);
  expect(JSON.stringify(renderer.toJSON())).toContain('Backend chưa hỗ trợ');
  await act(async () => renderer.unmount());
});
