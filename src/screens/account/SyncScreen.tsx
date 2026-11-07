import { Alert, Text, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopBar } from '@/components/TopBar';
import { vi } from '@/i18n/vi';
import type { ScreenProps } from '@/types/screen';
import { errorMessage } from '@/utils/errorMessage';
import { createStyles } from '@/theme/styles';

export function SyncScreen({
  navigate,
  user,
  cachedCount,
  savedAt,
  reviewQueue,
  syncingReviews,
  syncError,
  storageError,
  syncReviews,
  discardReview,
}: ScreenProps) {
  const { styles } = useStyles();
  if (!user)
    return (
      <EmptyState
        title="Bộ từ mẫu luôn có sẵn"
        description="Bạn có thể học 200 từ mẫu không cần mạng. Đăng nhập khi muốn tải bộ từ cá nhân."
        action="Về trang chủ"
        onPress={() => navigate('home')}
      />
    );
  const retry = () =>
    syncReviews().catch(cause =>
      Alert.alert('Chưa đồng bộ được', errorMessage(cause)),
    );
  const discard = (id: string) =>
    Alert.alert(vi.offline.discardTitle, vi.offline.discardMessage, [
      { text: vi.common.cancel, style: 'cancel' },
      {
        text: vi.offline.discard,
        style: 'destructive',
        onPress: () => {
          discardReview(id).catch(cause =>
            Alert.alert('Chưa xóa được bản chờ', errorMessage(cause)),
          );
        },
      },
    ]);
  return (
    <>
      <TopBar title={vi.offline.title} onBack={() => navigate('profile')} />
      <View style={styles.summary}>
        <Text style={styles.title}>{vi.offline.cached(cachedCount)}</Text>
        <Text style={styles.body}>
          {savedAt
            ? `Bản lưu: ${new Date(savedAt).toLocaleString('vi-VN')}`
            : vi.offline.empty}
        </Text>
        <Text style={styles.body}>{vi.offline.scope}</Text>
      </View>
      {!!storageError && <Text style={styles.error}>{storageError}</Text>}
      {!!syncError && (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {syncError}
        </Text>
      )}
      <PrimaryButton
        label={syncingReviews ? vi.offline.syncing : vi.offline.retry}
        disabled={syncingReviews}
        onPress={retry}
      />
      <Text style={styles.note}>{vi.offline.schedule}</Text>
      <Text style={styles.title}>
        {reviewQueue.length
          ? vi.offline.pending(reviewQueue.length)
          : vi.offline.saved}
      </Text>
      {reviewQueue.map(item => (
        <View key={item.reviewId} style={styles.attempt}>
          <Text style={styles.word}>{item.term ?? 'Từ đã ôn'}</Text>
          <Text style={styles.body}>
            {new Date(item.createdAt).toLocaleString('vi-VN')} · Mức nhớ{' '}
            {item.quality}/5
          </Text>
          {!!item.error && <Text style={styles.error}>{item.error}</Text>}
          <PrimaryButton
            label={vi.offline.discard}
            variant="secondary"
            disabled={syncingReviews}
            onPress={() => discard(item.reviewId)}
          />
        </View>
      ))}
    </>
  );
}
const useStyles = createStyles(({ colors, font }) => ({
  summary: {
    backgroundColor: colors.primaryTint,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    marginBottom: 16,
  },
  title: { ...font.title, color: colors.text, marginBottom: 10 },
  body: { ...font.body, color: colors.text },
  note: { ...font.note, color: colors.muted, marginVertical: 16 },
  word: { ...font.label, color: colors.text },
  error: { ...font.description, color: colors.error, marginVertical: 10 },
  attempt: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginTop: 12,
  },
}));
