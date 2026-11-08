import notifee, { AndroidImportance } from '@notifee/react-native';
import { DAILY_REMINDER_CHANNEL_ID } from './constants';
import { getLocale, type Language, t } from '@/i18n';

export function setupNotificationChannel(locale: Language = getLocale()) {
  return notifee.createChannel({
    id: DAILY_REMINDER_CHANNEL_ID,
    name: t('notifications.channelName', undefined, locale),
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}
