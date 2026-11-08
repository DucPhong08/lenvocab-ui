import { useCallback, useEffect } from 'react';
import { Alert, BackHandler } from 'react-native';
import type { ScreenProps } from '@/types/screen';
import { useI18n } from '@/i18n';

export function useStudyExit({
  navigate,
  active,
  busy = false,
}: {
  navigate: ScreenProps['navigate'];
  active: boolean;
  busy?: boolean;
}) {
  const { strings } = useI18n();
  const exit = useCallback(() => {
    if (busy) {
      Alert.alert(strings.study.savingTitle, strings.study.savingMessage);
      return;
    }
    if (!active) {
      navigate('review');
      return;
    }
    Alert.alert(
      strings.study.exitTitle,
      strings.study.exitMessage,
      [
        { text: strings.common.continue, style: 'cancel' },
        { text: strings.study.exitAction, onPress: () => navigate('review') },
      ],
    );
  }, [active, busy, navigate, strings]);
  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      exit();
      return true;
    });
    return () => listener.remove();
  }, [exit]);
  return exit;
}
