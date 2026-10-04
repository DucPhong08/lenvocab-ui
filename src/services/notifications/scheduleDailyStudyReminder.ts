import notifee, { RepeatFrequency, TriggerType } from '@notifee/react-native';
import { DAILY_REMINDER_CHANNEL_ID } from './constants';
import { requestNotificationPermission } from './requestNotificationPermission';
import { setupNotificationChannel } from './setupNotificationChannel';

export async function scheduleDailyStudyReminder(hour = 20, minute = 0) {
  if (!(await requestNotificationPermission())) {
    return false;
  }

  await setupNotificationChannel();

  const scheduledTime = new Date();
  scheduledTime.setHours(hour, minute, 0, 0);
  if (scheduledTime.getTime() <= Date.now()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  await notifee.createTriggerNotification(
    {
      id: 'daily_study_reminder',
      title: 'Giữ vững chuỗi học LensVocab! 🔥',
      body: 'Bạn có từ cần ôn tập. Hãy dành vài phút để củng cố trí nhớ nhé.',
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
