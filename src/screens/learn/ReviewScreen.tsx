import { Pressable, Text, View } from 'react-native';
import { CircleHelp, Layers3 } from 'lucide-react-native';
import { Eyebrow } from '@/components/Eyebrow';
import { ScreenTitle } from '@/components/ScreenTitle';
import { SectionHeader } from '@/components/SectionHeader';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { styles } from './styles';

export function ReviewScreen({ navigate, saved, user, due }: ScreenProps) {
  return (
    <View style={styles.page}>
      <ScreenTitle
        kicker="LUYỆN TẬP MỖI NGÀY"
        title={'Một chút hôm nay.\nNhớ mãi mai sau.'}
        subtitle="Chọn cách học phù hợp với bạn nhé."
      />
      <View style={styles.progressCard}>
        <Eyebrow light>{user ? 'HÀNG ĐỢI ÔN HÔM NAY' : 'ÔN TẬP MINH HỌA'}</Eyebrow>
        <Text style={styles.progressTitle}>Cứ tiếp tục nhé!</Text>
        <Text style={styles.progressSubtitle}>
          {user ? `${due.length} từ đến hạn ôn · ${saved.length} từ đã lưu trên tài khoản.` : 'Bạn có thể thử bộ thẻ mẫu. Đăng nhập để lưu tiến độ học.'}
        </Text>
        <View style={styles.progressDecoration}>
          <Layers3 size={30} color={colors.lime} />
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
            Lật thẻ, ghi nhớ từ theo nhịp của bạn.
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
          <Text style={styles.modeTitle}>Quiz mẫu</Text>
          <Text style={styles.modeDescription}>
            Thử 4 câu hỏi minh họa, không ghi nhận lên tài khoản.
          </Text>
          <Text style={styles.modeLink}>4 câu hỏi →</Text>
        </View>
      </Pressable>
      <Text style={styles.quote}>
        “Little by little, a little becomes a lot.”
      </Text>
    </View>
  );
}
