import { Image, Pressable, Text, View } from 'react-native';
import {
  ArrowRight,
  Bookmark,
  Camera,
  Check,
  Sparkles,
} from 'lucide-react-native';
import { Brand } from '@/components/Brand';
import { Eyebrow } from '@/components/Eyebrow';
import { SectionHeader } from '@/components/SectionHeader';
import { WordRow } from '@/components/WordRow';
import { cardWord } from '@/api/mappers/cardWord';
import { EmptyState } from '@/components/EmptyState';
import { allWords } from '@/data/scenes';
import { sceneImage } from '@/theme/sceneImage';
import { colors, shadow } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { styles } from './styles';

export function HomeScreen({
  navigate,
  token,
  openWord,
  saved,
  totalSaved,
  cards,
  history,
  user,
  due,
  loadingData,
  dataError,
  reloadData,
}: ScreenProps) {
  const words = user ? cards.slice(0, 3).map(cardWord) : allWords.slice(0, 2);
  return (
    <View style={styles.page}>
      <View style={styles.homeTop}>
        <Brand />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mở hồ sơ"
          onPress={() => navigate('profile')}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {(user?.display_name || user?.username || 'K')[0].toUpperCase()}
          </Text>
        </Pressable>
      </View>
      <View style={styles.greeting}>
        <Eyebrow>Học từ những gì bạn thấy</Eyebrow>
        <Text style={styles.greetingTitle}>
          Chào {user?.display_name || user?.username || 'bạn'},{'\n'}hôm nay học
          gì?
        </Text>
        <Text style={styles.description}>
          Thế giới quanh bạn luôn có điều mới để học.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Bắt đầu chọn hoặc chụp ảnh"
        onPress={() => navigate('camera')}
        style={({ pressed }) => [
          styles.hero,
          shadow,
          pressed && { opacity: 0.9 },
        ]}
      >
        <View style={styles.heroCopy}>
          <View style={styles.heroPill}>
            <Sparkles size={12} color={colors.forest} />
            <Text style={styles.heroPillText}>Từ ảnh thành thẻ từ</Text>
          </View>
          <Text style={styles.heroTitle}>Chụp một vật.{'\n'}Nhớ một từ.</Text>
          <View style={styles.heroAction}>
            <Text style={styles.heroActionText}>Bắt đầu quét</Text>
            <ArrowRight size={16} color={colors.forest} />
          </View>
        </View>
        <View style={styles.heroPicture}>
          <Image source={sceneImage('desk')} style={styles.heroImage} />
          <View style={styles.heroLabel}>
            <Text style={styles.heroLabelText}>notebook</Text>
            <Check size={12} color={colors.forest} />
          </View>
        </View>
      </Pressable>
      <Text style={styles.demoNote}>
        {user
          ? 'Chọn vật trong ảnh, lưu thành sticker và ôn lại mỗi ngày.'
          : 'Thử quét ảnh ngay. Đăng nhập khi bạn muốn lưu thẻ.'}
      </Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Bookmark size={18} color={colors.forest} />
          </View>
          <View>
            <Text style={styles.statValue}>{totalSaved} từ</Text>
            <Text style={styles.statLabel}>
              {user ? 'Trong tài khoản' : 'Đăng nhập để lưu'}
            </Text>
          </View>
        </View>
        <View style={styles.statSeparator} />
        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Camera size={18} color={colors.forest} />
          </View>
          <View>
            <Text style={styles.statValue}>
              {user ? `${user.daily_quota_left} lượt` : `${history.length} lần`}
            </Text>
            <Text style={styles.statLabel}>
              {user ? 'Quét còn hôm nay' : 'Quét phiên này'}
            </Text>
          </View>
        </View>
      </View>
      <SectionHeader
        kicker="MỘT CHÚT MỖI NGÀY"
        title="Ôn tập hôm nay"
        action="Xem thêm"
        onAction={() => navigate('review')}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => navigate(user && !due.length ? 'review' : 'flashcards')}
        style={({ pressed }) => [
          styles.reviewCard,
          shadow,
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.reviewArt}>
          <Text style={styles.reviewArtText}>Aa.</Text>
        </View>
        <View style={styles.reviewCopy}>
          <Text style={styles.reviewTitle}>
            {user && !due.length
              ? 'Hôm nay chưa có từ đến hạn'
              : '5 phút cho trí nhớ'}
          </Text>
          <Text style={styles.reviewSubtitle}>
            {user ? `${due.length} từ cần ôn hôm nay` : 'Thử bộ thẻ minh họa'}
          </Text>
          <Text style={styles.reviewLink}>
            {user && !due.length ? 'Xem các cách luyện tập' : 'Bắt đầu ôn tập'}
          </Text>
        </View>
      </Pressable>
      <SectionHeader
        title={user ? 'Từ trong kho của bạn' : 'Khám phá từ mẫu'}
        action={user ? 'Xem kho từ' : 'Xem cảnh mẫu'}
        onAction={() => navigate(user ? 'saved' : 'camera')}
      />
      {words.map(word => (
        <WordRow
          key={word.id}
          word={word}
          token={token}
          saved={saved.includes(word.id)}
          onOpen={() => openWord(word.id)}
        />
      ))}
      {user && !words.length && (
        <EmptyState
          loading={loadingData}
          title={
            loadingData
              ? 'Đang tải kho từ'
              : dataError
              ? 'Chưa tải được kho từ'
              : 'Tạo thẻ đầu tiên của bạn'
          }
          description={
            loadingData
              ? 'Các thẻ của bạn sẽ xuất hiện ở đây.'
              : dataError ||
                'Chụp một vật quen thuộc, chọn vật rồi lưu thẻ kèm sticker.'
          }
          action={
            loadingData
              ? undefined
              : dataError
              ? 'Tải lại kho từ'
              : 'Quét ảnh đầu tiên'
          }
          onPress={
            dataError
              ? () => reloadData().catch(() => {})
              : () => navigate('camera')
          }
        />
      )}
    </View>
  );
}
