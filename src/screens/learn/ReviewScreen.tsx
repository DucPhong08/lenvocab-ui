import { vi } from '@/i18n/vi';
import { Text } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { ScreenTitle } from '@/components/ScreenTitle';
import { StudyCard } from '@/components/StudyCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SESSION_SIZE } from '@/data/study';
import type { ScreenProps } from '@/types/screen';
import { useStyles } from './styles/styles';

export function ReviewScreen({
  navigate,
  totalSaved,
  cards,
  due,
  user,
  loadingData,
  dataError,
  reloadData,
}: ScreenProps) {
  const { styles } = useStyles();
  if (loadingData)
    return (
      <EmptyState
        loading
        title="Đang tải lịch ôn"
        description="Vui lòng chờ trong giây lát."
      />
    );
  if (dataError)
    return (
      <EmptyState
        title="Không thể tải lịch ôn"
        description={dataError}
        action="Thử lại"
        onPress={() => reloadData()}
      />
    );
  if (user && !totalSaved && !cards.length && !due.length)
    return (
      <EmptyState
        title="Chưa có từ để luyện tập"
        description="Quét và lưu từ đầu tiên để bắt đầu ôn tập."
        action="Quét từ mới"
        onPress={() => navigate('camera')}
      />
    );
  const done = !!user && !due.length;
  const count = user ? Math.min(SESSION_SIZE, due.length) : SESSION_SIZE;
  return (
    <>
      <ScreenTitle title={vi.review.title} subtitle={vi.review.subtitle} />
      <StudyCard
        title={done ? 'Chưa có từ đến hạn.' : `Chỉ ${count} từ một lượt.`}
        description={
          user
            ? done
              ? 'Bạn vẫn có thể luyện phản xạ bằng Quiz.'
              : `${due.length} từ đang chờ ôn. Chọn mức nhớ để hẹn lần ôn tiếp theo.`
            : 'Đây là thẻ mẫu. Đăng nhập để có lịch ôn của riêng bạn.'
        }
      >
        <PrimaryButton
          label={done ? 'Hôm nay chưa cần ôn' : vi.review.start(count)}
          disabled={done}
          onPress={() => navigate('flashcards')}
        />
      </StudyCard>
      <PrimaryButton
        label={vi.review.quiz}
        variant="secondary"
        onPress={() => navigate('quiz')}
      />
      <Text style={styles.hint}>{vi.review.hint(SESSION_SIZE)}</Text>
    </>
  );
}
