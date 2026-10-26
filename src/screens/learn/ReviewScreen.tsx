import { Pressable, Text, View } from 'react-native';
import { Award, CircleHelp, Layers3 } from 'lucide-react-native';
import { EmptyState } from '@/components/EmptyState';
import { Eyebrow } from '@/components/Eyebrow';
import { ScreenTitle } from '@/components/ScreenTitle';
import { SectionHeader } from '@/components/SectionHeader';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { styles } from './styles';

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
  const goal = user?.preferences?.daily_review_goal ?? 15;
  const hasNoCards =
    !!user && totalSaved === 0 && cards.length === 0 && due.length === 0;
  const isDoneToday = !!user && !hasNoCards && due.length === 0;

  if (loadingData) {
    return (
      <View style={styles.page}>
        <EmptyState
          loading
          title="Đang tải lịch ôn"
          description="Vui lòng chờ trong giây lát."
        />
      </View>
    );
  }

  if (dataError) {
    return (
      <View style={styles.page}>
        <EmptyState
          title="Không thể tải lịch ôn"
          description={dataError}
          action="Thử lại"
          onPress={() => reloadData()}
        />
      </View>
    );
  }

  if (hasNoCards) {
    return (
      <View style={styles.page}>
        <EmptyState
          title="Chưa có từ để luyện tập"
          description="Quét và lưu từ đầu tiên để bắt đầu ôn tập."
          action="Quét từ mới"
          onPress={() => navigate('camera')}
        />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScreenTitle
        kicker="LUYỆN TẬP MỖI NGÀY"
        title="Ôn tập hôm nay"
        subtitle="Lật thẻ để nhớ nghĩa, hoặc thử một bài trắc nghiệm ngắn."
      />

      <View style={styles.progressCard}>
        <Eyebrow light>{user ? 'LỊCH ÔN HÔM NAY' : 'ÔN TẬP MINH HỌA'}</Eyebrow>
        <Text style={styles.progressTitle}>
          {isDoneToday ? 'Đã hoàn thành xuất sắc!' : 'Cứ tiếp tục nhé!'}
        </Text>
        <Text style={styles.progressSubtitle}>
          {user
            ? isDoneToday
              ? 'Bạn đã ôn hết từ đến hạn. Bạn vẫn có thể luyện thêm bằng trắc nghiệm.'
              : `${due.length} từ đến hạn ôn / mục tiêu ${goal} từ hôm nay · ${totalSaved} từ trong kho thẻ.`
            : 'Thử bộ thẻ mẫu. Đăng nhập để lưu tiến độ và có lịch ôn riêng.'}
        </Text>
        <View style={styles.progressDecoration}>
          {isDoneToday ? (
            <Award size={32} color={colors.lime} />
          ) : (
            <Layers3 size={30} color={colors.lime} />
          )}
        </View>
      </View>

      <SectionHeader kicker="CHỌN CÁCH HỌC" title="Cùng bắt đầu nào" />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Bắt đầu Flashcards"
        disabled={isDoneToday}
        accessibilityState={{ disabled: isDoneToday }}
        onPress={() => navigate('flashcards')}
        style={[styles.modeCard, styles.flashMode]}
      >
        <View style={styles.modeArt}>
          <Text style={styles.modeArtText}>Aa.</Text>
        </View>
        <View style={styles.fill}>
          <Eyebrow>01 / GHI NHỚ</Eyebrow>
          <Text style={styles.modeTitle}>Flashcards</Text>
          <Text style={styles.modeDescription}>
            Lật thẻ, nghe phát âm và chọn mức độ bạn nhớ.
          </Text>
          <Text style={styles.modeLink}>
            {isDoneToday
              ? 'Hôm nay đã ôn xong'
              : user
              ? `${due.length} từ đến hạn hôm nay`
              : 'Bộ từ mẫu'}
          </Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Bắt đầu Quiz nhanh"
        onPress={() => navigate('quiz')}
        style={[styles.modeCard, styles.quizMode]}
      >
        <View style={[styles.modeArt, styles.quizArt]}>
          <CircleHelp size={34} color={colors.forest} />
        </View>
        <View style={styles.fill}>
          <Eyebrow>02 / THỬ THÁCH</Eyebrow>
          <Text style={styles.modeTitle}>Quiz nhanh</Text>
          <Text style={styles.modeDescription}>
            Chọn nghĩa đúng trong 4 đáp án. Kết quả không đổi lịch ôn.
          </Text>
          <Text style={styles.modeLink}>Luyện phản xạ →</Text>
        </View>
      </Pressable>

      <Text style={styles.quote}>
        “Little by little, a little becomes a lot.”
      </Text>
    </View>
  );
}
