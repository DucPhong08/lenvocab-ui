import { Pressable, Text, View } from 'react-native';
import { Bookmark, ChevronRight, Clock3, Sparkles, Volume2 } from 'lucide-react-native';
import { Brand } from '@/components/Brand';
import { Eyebrow } from '@/components/Eyebrow';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { styles } from './styles';
import { MenuItem } from './components/MenuItem';

export function ProfileScreen({ navigate, saved, history, user, onLogout }: ScreenProps) {
  return (
    <View style={styles.page}>
      <ScreenTitle
        kicker="GÓC CỦA BẠN"
        title="Hồ sơ của tôi."
        subtitle={user ? `Tài khoản ${user.account_tier} · Đồng bộ từ trên máy chủ` : 'Dùng thử không cần tài khoản · Không lưu bộ từ.'}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Xem trạng thái tài khoản"
        onPress={() => { if (!user) navigate('auth'); }}
        style={styles.identity}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{(user?.display_name || user?.email || 'K')[0].toUpperCase()}</Text>
        </View>
        <View style={styles.fill}>
          <Text style={styles.identityName}>{user?.display_name || 'Khách tham quan'}</Text>
          <Text style={styles.identitySub}>{user ? `${user.email} · ${user.account_tier}` : 'Chạm để đăng nhập hoặc tạo tài khoản'}</Text>
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
      {user && <View style={styles.menu}>
        <View style={styles.menuItem}>
          <View style={styles.menuIcon}><Volume2 size={19} color={colors.forest} /></View>
          <View style={styles.fill}>
            <Text style={styles.menuText}>Lượt quét còn lại hôm nay</Text>
            <Text style={styles.menuHint}>{user.daily_quota_left} lượt · gói {user.account_tier}</Text>
          </View>
        </View>
      </View>}
      {user ? <PrimaryButton label="Đăng xuất" variant="secondary" onPress={() => onLogout()} /> : <PrimaryButton label="Đăng nhập để đồng bộ" onPress={() => navigate('auth')} />}
      <View style={styles.footer}>
        <Brand />
        <Text style={styles.footerText}>{user ? 'Từ đã lưu và tiến độ ôn tập được giữ trên tài khoản.' : 'Chế độ khách không lưu bộ từ hoặc lịch sử. Ảnh chụp có thể ở bộ nhớ đệm tạm của hệ điều hành.'}</Text>
      </View>
    </View>
  );
}
