import notifee, { RepeatFrequency, TriggerType } from '@notifee/react-native';
import { DAILY_REMINDER_CHANNEL_ID } from './constants';
import { requestNotificationPermission } from './requestNotificationPermission';
import { setupNotificationChannel } from './setupNotificationChannel';
import { getLocale, type Language, t } from '@/i18n';

export async function scheduleDailyStudyReminder(
  hour = 20,
  minute = 0,
  locale: Language = getLocale(),
) {
  if (!(await requestNotificationPermission())) {
    return false;
  }

  await setupNotificationChannel(locale);

  const scheduledTime = new Date();
  scheduledTime.setHours(hour, minute, 0, 0);
  if (scheduledTime.getTime() <= Date.now()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  await notifee.createTriggerNotification(
    {
      id: 'daily_study_reminder',
      title: t('notifications.reminderTitle', undefined, locale),
      body: t('notifications.reminderBody', undefined, locale),
      android: {
        channelId: DAILY_REMINDER_CHANNEL_ID,
        pressAction: { id: 'default' },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: scheduledTime.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    },
  );

  return true;
}
