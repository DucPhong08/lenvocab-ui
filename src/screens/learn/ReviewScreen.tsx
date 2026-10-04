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
  saved,
  user,
  due,
  dataError,
  reloadData,
}: ScreenProps) {
  const goal = user?.preferences?.daily_review_goal ?? 15;
  const isDoneToday = user && due.length === 0;

  if (user && dataError) {
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

  return (
    <View style={styles.page}>
      <ScreenTitle
        kicker="LUYỆN TẬP MỖI NGÀY"
        title={'Một chút hôm nay.\nNhớ mãi mai sau.'}
        subtitle="Ôn tập ngắt quãng (SM-2) giúp bạn nhớ từ lâu bền mà không bị quá tải."
      />

      <View style={styles.progressCard}>
        <Eyebrow light>
          {user ? 'HÀNG ĐỢI ÔN HÔM NAY (SM-2)' : 'ÔN TẬP MINH HỌA'}
        </Eyebrow>
        <Text style={styles.progressTitle}>
          {isDoneToday ? 'Đã hoàn thành xuất sắc!' : 'Cứ tiếp tục nhé!'}
        </Text>
        <Text style={styles.progressSubtitle}>
          {user
            ? isDoneToday
              ? `Tất cả ${saved.length} từ đã được ôn tập đúng hạn. Hệ thống sẽ tự động nhắc bạn khi đến chu kỳ ôn tiếp theo.`
              : `${due.length} từ đến hạn ôn / mục tiêu ${goal} từ hôm nay · ${saved.length} từ trong kho thẻ.`
            : 'Bạn có thể thử bộ thẻ mẫu. Đăng nhập để thuật toán SM-2 cá nhân hóa lịch ôn cho bạn.'}
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
            Lật thẻ, nghe phát âm và tự chấm điểm 0–5 theo phương pháp SM-2.
          </Text>
          <Text style={styles.modeLink}>
            {user ? `${due.length} từ đến hạn hôm nay` : 'Bộ từ mẫu'} →
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
            Kiểm tra phản xạ chọn nghĩa trắc nghiệm 4 đáp án.
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
