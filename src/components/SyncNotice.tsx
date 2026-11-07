import { Pressable, Text } from 'react-native';
import { CloudDownload } from 'lucide-react-native';
import { vi } from '@/i18n/vi';
import { createStyles } from '@/theme/styles';

export function SyncNotice({
  cached,
  pending,
  failed,
  syncing,
  storageError,
  onPress,
}: {
  cached: boolean;
  pending: number;
  failed: number;
  syncing: boolean;
  storageError: string | null;
  onPress: () => void;
}) {
  const { styles, colors } = useStyles();
  if (!cached && !pending && !failed && !storageError) return null;
  const label = storageError
    ? 'Chưa lưu được trên máy'
    : failed
    ? vi.offline.rejected(failed)
    : syncing && pending
    ? vi.offline.syncing
    : pending
    ? vi.offline.pending(pending)
    : vi.offline.usingCache;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. Xem trạng thái đồng bộ`}
      onPress={onPress}
      style={styles.notice}
    >
      <CloudDownload size={18} color={colors.primaryText} />
      <Text accessibilityLiveRegion="polite" style={styles.text}>
        {label}
      </Text>
    </Pressable>
  );
}
const useStyles = createStyles(({ colors, font }) => ({
  notice: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 600,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 12,
    minHeight: 44,
    backgroundColor: colors.primaryTint,
  },
  text: { ...font.note, color: colors.primaryText, flex: 1 },
}));
