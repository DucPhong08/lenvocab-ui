import { setupNotificationChannel } from '@/services/notifications/setupNotificationChannel';
import { scheduleDailyStudyReminder } from '@/services/notifications/scheduleDailyStudyReminder';
import { requestNotificationPermission } from '@/services/notifications/requestNotificationPermission';
import { DAILY_REMINDER_CHANNEL_ID } from '@/services/notifications/constants';
import notifee, { AndroidImportance, AuthorizationStatus, RepeatFrequency, TriggerType } from '@notifee/react-native';

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn().mockResolvedValue('lenvocab_daily_reminder'),
    requestPermission: jest.fn().mockResolvedValue({ authorizationStatus: 1 }),
    createTriggerNotification: jest.fn().mockResolvedValue('notification-id'),
  },
  AndroidImportance: { HIGH: 4 },
  AuthorizationStatus: { AUTHORIZED: 1, DENIED: 0 },
  TriggerType: { TIMESTAMP: 0 },
  RepeatFrequency: { DAILY: 0 },
}));

describe('Notifications Service (i18n & scheduling)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setupNotificationChannel', () => {
    test('creates channel with Vietnamese name by default', async () => {
      await setupNotificationChannel('vi');

      expect(notifee.createChannel).toHaveBeenCalledWith({
        id: DAILY_REMINDER_CHANNEL_ID,
        name: 'Nhắc nhở ôn tập hằng ngày',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    });

    test('creates channel with English name when locale is en', async () => {
      await setupNotificationChannel('en');

      expect(notifee.createChannel).toHaveBeenCalledWith({
        id: DAILY_REMINDER_CHANNEL_ID,
        name: 'Daily Study Reminder',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    });
  });

  describe('scheduleDailyStudyReminder', () => {
    test('schedules notification in Vietnamese when locale is vi', async () => {
      const scheduled = await scheduleDailyStudyReminder(20, 0, 'vi');
      expect(scheduled).toBe(true);

      expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'daily_study_reminder',
          title: 'Giữ vững chuỗi học LenVocab! 🔥',
          body: 'Bạn có từ cần ôn tập. Hãy dành vài phút để củng cố trí nhớ nhé.',
          android: {
            channelId: DAILY_REMINDER_CHANNEL_ID,
            pressAction: { id: 'default' },
          },
        }),
        expect.objectContaining({
          type: TriggerType.TIMESTAMP,
          repeatFrequency: RepeatFrequency.DAILY,
        }),
      );
    });

    test('schedules notification in English when locale is en', async () => {
      const scheduled = await scheduleDailyStudyReminder(20, 0, 'en');
      expect(scheduled).toBe(true);

      expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'daily_study_reminder',
          title: 'Keep your LenVocab streak alive! 🔥',
          body: 'You have words due for review. Take a few minutes to reinforce your memory.',
          android: {
            channelId: DAILY_REMINDER_CHANNEL_ID,
            pressAction: { id: 'default' },
          },
        }),
        expect.objectContaining({
          type: TriggerType.TIMESTAMP,
          repeatFrequency: RepeatFrequency.DAILY,
        }),
      );
    });

    test('returns false when notification permission is denied', async () => {
      jest.mocked(notifee.requestPermission).mockResolvedValueOnce({
        authorizationStatus: AuthorizationStatus.DENIED,
      } as any);

      const scheduled = await scheduleDailyStudyReminder(20, 0);
      expect(scheduled).toBe(false);
      expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
    });
  });

  describe('requestNotificationPermission', () => {
    test('returns true when authorized', async () => {
      jest.mocked(notifee.requestPermission).mockResolvedValueOnce({
        authorizationStatus: AuthorizationStatus.AUTHORIZED,
      } as any);

      const hasPermission = await requestNotificationPermission();
      expect(hasPermission).toBe(true);
    });

    test('returns false when denied', async () => {
      jest.mocked(notifee.requestPermission).mockResolvedValueOnce({
        authorizationStatus: AuthorizationStatus.DENIED,
      } as any);

      const hasPermission = await requestNotificationPermission();
      expect(hasPermission).toBe(false);
    });
  });
});
