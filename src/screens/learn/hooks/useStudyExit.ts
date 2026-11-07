import { useCallback, useEffect } from 'react';
import { Alert, BackHandler } from 'react-native';
import type { ScreenProps } from '@/types/screen';

export function useStudyExit({
  navigate,
  active,
  busy = false,
}: {
  navigate: ScreenProps['navigate'];
  active: boolean;
  busy?: boolean;
}) {
  const exit = useCallback(() => {
    if (busy) {
      Alert.alert('Đang lưu lần ôn', 'Chờ lưu xong rồi hãy rời lượt học nhé.');
      return;
    }
    if (!active) {
      navigate('review');
      return;
    }
    Alert.alert(
      'Rời lượt học này?',
      'Lượt đang học sẽ bắt đầu lại. Các lần ôn đã lưu vẫn được giữ.',
      [
        { text: 'Học tiếp', style: 'cancel' },
        { text: 'Rời lượt học', onPress: () => navigate('review') },
      ],
    );
  }, [active, busy, navigate]);
  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      exit();
      return true;
    });
    return () => listener.remove();
  }, [exit]);
  return exit;
}
