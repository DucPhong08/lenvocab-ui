import notifee, { AndroidImportance } from '@notifee/react-native';
import { DAILY_REMINDER_CHANNEL_ID } from './constants';

export function setupNotificationChannel() {
  return notifee.createChannel({
    id: DAILY_REMINDER_CHANNEL_ID,
    name: 'Nhắc nhở ôn tập hằng ngày',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}
