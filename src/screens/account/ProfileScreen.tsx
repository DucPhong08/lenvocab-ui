import { Pressable, Text, View } from 'react-native';
import {
  Bookmark,
  ChevronRight,
  Clock3,
  Gauge,
  Headphones,
  Sparkles,
  Target,
} from 'lucide-react-native';
import { Brand } from '@/components/Brand';
import { Eyebrow } from '@/components/Eyebrow';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { styles } from './styles';
import { MenuItem } from './components/MenuItem';

export function ProfileScreen({
  navigate,
  saved,
  history,
  user,
  onLogout,
}: ScreenProps) {
  const prefs = user?.preferences;

  return (
    <View style={styles.page}>
      <ScreenTitle
        kicker="GÓC CỦA BẠN"
        title="Hồ sơ của tôi."
        subtitle={
          user
            ? `Tài khoản ${user.account_tier} · Đồng bộ qua Cloud AI & Spaced Repetition`
            : 'Dùng thử không cần tài khoản · Không lưu bộ từ.'
        }
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Xem trạng thái tài khoản"
        onPress={() => {
          if (!user) navigate('auth');
        }}
        style={styles.identity}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>
            {(user?.display_name || user?.email || 'K')[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.fill}>
          <Text style={styles.identityName}>
            {user?.display_name || 'Khách tham quan'}
          </Text>
          <Text style={styles.identitySub}>
            {user
              ? `${user.email} · Gói ${user.account_tier}`
              : 'Chạm để đăng nhập hoặc tạo tài khoản'}
          </Text>
        </View>
        <ChevronRight size={19} color={colors.muted} />
      </Pressable>

      <View style={styles.profileStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{saved.length}</Text>
          <Text style={styles.statCaption}>từ đã lưu</Text>
        </View>
        <View style={styles.verticalLine} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statCaption}>lần quét</Text>
        </View>
        {user && (
          <>
            <View style={styles.verticalLine} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user.daily_quota_left}</Text>
              <Text style={styles.statCaption}>lượt quét còn</Text>
            </View>
          </>
        )}
      </View>

      <Eyebrow>HỌC TẬP</Eyebrow>
      <View style={styles.menu}>
        <MenuItem
          label="Từ vựng đã lưu"
          icon={<Bookmark size={19} color={colors.forest} />}
          onPress={() => navigate('saved')}
        />
        <MenuItem
          label="Lịch sử quét"
          icon={<Clock3 size={19} color={colors.forest} />}
          onPress={() => navigate('history')}
        />
        <MenuItem
          label="Giới thiệu ứng dụng"
          icon={<Sparkles size={19} color={colors.forest} />}
          onPress={() => navigate('onboarding')}
        />
      </View>

      {user && (
        <>
          <Eyebrow>CẤU HÌNH HỌC TẬP (AWS AI)</Eyebrow>
          <View style={styles.menu}>
            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Headphones size={19} color={colors.forest} />
              </View>
              <View style={styles.fill}>
                <Text style={styles.menuText}>Giọng phát âm AWS Polly</Text>
                <Text style={styles.menuHint}>
                  {prefs?.preferred_voice_id ?? 'Joanna'} · Tốc độ {prefs?.voice_speed ?? 1.0}x
                </Text>
              </View>
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Target size={19} color={colors.forest} />
              </View>
              <View style={styles.fill}>
                <Text style={styles.menuText}>Mục tiêu ôn mỗi ngày</Text>
                <Text style={styles.menuHint}>
                  {prefs?.daily_review_goal ?? 15} từ/ngày (Giới hạn chống nản SM-2)
                </Text>
              </View>
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Gauge size={19} color={colors.forest} />
              </View>
              <View style={styles.fill}>
                <Text style={styles.menuText}>Hạn mức quét ảnh</Text>
                <Text style={styles.menuHint}>
                  {user.daily_quota_left} lượt còn lại hôm nay (Gói {user.account_tier})
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      {user ? (
        <PrimaryButton
          label="Đăng xuất"
          variant="secondary"
          onPress={() => onLogout()}
        />
      ) : (
        <PrimaryButton
          label="Đăng nhập để đồng bộ"
          onPress={() => navigate('auth')}
        />
      )}

      <View style={styles.footer}>
        <Brand />
        <Text style={styles.footerText}>
          {user
            ? 'Từ đã lưu và tiến độ ôn tập được giữ an toàn trên máy chủ LensVocab.'
            : 'Chế độ khách không lưu bộ từ hoặc lịch sử. Đăng nhập để sử dụng đầy đủ tính năng.'}
        </Text>
      </View>
    </View>
  );
}
