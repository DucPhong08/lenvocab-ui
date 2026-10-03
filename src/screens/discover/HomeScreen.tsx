import { Image, Pressable, Text, View } from 'react-native';
import { ArrowRight, Bookmark, Camera, Check, Sparkles } from 'lucide-react-native';
import { Brand } from '@/components/Brand';
import { Eyebrow } from '@/components/Eyebrow';
import { SectionHeader } from '@/components/SectionHeader';
import { WordRow } from '@/components/WordRow';
import { allWords } from '@/data/scenes';
import { sceneImage } from '@/theme/sceneImage';
import { colors, shadow } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { styles } from './styles';

export function HomeScreen({
  navigate,
  openWord,
  saved,
  toggleSaved,
  history,
  user,
  due,
}: ScreenProps) {
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
          <Text style={styles.avatarText}>{(user?.display_name || user?.email || 'K')[0].toUpperCase()}</Text>
        </Pressable>
      </View>
      <View style={styles.greeting}>
        <Eyebrow>MỖI NGÀY MỘT ĐIỀU MỚI</Eyebrow>
        <Text style={styles.greetingTitle}>Chào {user?.display_name || 'bạn'},{'\n'}hôm nay học gì?</Text>
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
            <Text style={styles.heroPillText}>HỌC TỪ THẾ GIỚI THẬT</Text>
          </View>
          <Text style={styles.heroTitle}>Chụp ảnh.{'\n'}Học cả thế giới.</Text>
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
        {user ? 'ẢNH THẬT · NHẬN DIỆN AI' : 'CHẾ ĐỘ KHÁCH · QUÉT ẢNH THẬT, KHÔNG LƯU BỘ TỪ'}
      </Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Bookmark size={18} color={colors.forest} />
          </View>
          <View>
            <Text style={styles.statValue}>{saved.length} từ</Text>
            <Text style={styles.statLabel}>{user ? 'Trong tài khoản' : 'Đăng nhập để lưu'}</Text>
          </View>
        </View>
        <View style={styles.statSeparator} />
        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Camera size={18} color={colors.forest} />
          </View>
          <View>
            <Text style={styles.statValue}>{user ? `${user.daily_quota_left} lượt` : `${history.length} lần`}</Text>
            <Text style={styles.statLabel}>{user ? 'Quét còn hôm nay' : 'Quét phiên này'}</Text>
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
        onPress={() => navigate('flashcards')}
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
          <Text style={styles.reviewTitle}>5 phút cho trí nhớ</Text>
          <Text style={styles.reviewSubtitle}>{user ? `${due.length} từ cần ôn hôm nay` : 'Thử bộ thẻ minh họa'}</Text>
          <Text style={styles.reviewLink}>Bắt đầu ôn tập →</Text>
        </View>
      </Pressable>
      <SectionHeader
        title="Từ vựng quanh bạn"
        action="Tất cả"
        onAction={() => navigate('saved')}
      />
      {allWords.slice(0, 2).map(word => (
        <WordRow
          key={word.id}
          word={word}
          saved={saved.includes(word.id)}
          onOpen={() => openWord(word.id)}
          onSave={saved.includes(word.id) ? undefined : () => toggleSaved(word.id)}
        />
      ))}
    </View>
  );
}
