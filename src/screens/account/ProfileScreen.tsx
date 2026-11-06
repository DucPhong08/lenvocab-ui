import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  Bookmark,
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
  totalSaved,
  onVoiceSpeedChange,
  preferencesBusy,
  history,
  user,
  onGoogleLink,
  googleLinkBusy,
  onLogout,
}: ScreenProps) {
  const prefs = user?.preferences;
  const displayName =
    user?.display_name?.trim() ||
    user?.username ||
    (user ? 'Người học' : 'Khách tham quan');

  return (
    <>
      <ScreenTitle
        kicker="GÓC CỦA BẠN"
        title="Góc học tập của bạn"
        subtitle={
          user
            ? 'Từ đã lưu và lịch ôn luôn theo tài khoản của bạn.'
            : 'Dùng thử không cần tài khoản · Không lưu bộ từ.'
        }
      />

      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>
            {displayName[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.fill}>
          <Text style={styles.identityName}>{displayName}</Text>
          <Text style={styles.identitySub}>
            {user
              ? `${user.username || user.email || 'Tài khoản Google'} · Gói ${
                  user.account_tier
                }`
              : 'Đăng nhập để lưu từ và tiến độ học'}
          </Text>
        </View>
      </View>

      <View style={styles.profileStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalSaved}</Text>
          <Text style={styles.statCaption}>từ đã lưu</Text>
        </View>
        <View style={styles.verticalLine} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statCaption}>quét phiên này</Text>
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
          icon={<Bookmark size={19} color={colors.primary} />}
          onPress={() => navigate('saved')}
        />
        <MenuItem
          label="Lịch sử quét"
          icon={<Clock3 size={19} color={colors.primary} />}
          onPress={() => navigate('history')}
        />
        <MenuItem
          label="Giới thiệu ứng dụng"
          icon={<Sparkles size={19} color={colors.primary} />}
          onPress={() => navigate('onboarding')}
        />
      </View>

      {user && (
        <>
          <Eyebrow>Tùy chọn học tập</Eyebrow>
          <View style={styles.menu}>
            <SettingRow
              icon={<Headphones size={19} color={colors.primary} />}
              label="Giọng phát âm chuẩn"
              description={prefs?.preferred_voice_id ?? 'Joanna'}
            />

            <View style={styles.menuItem}>
              <View style={styles.fill}>
                <Text style={styles.menuText}>Tốc độ phát âm</Text>
                <View style={styles.speedOptions}>
                  {[0.75, 1, 1.25].map(speed => (
                    <Pressable
                      key={speed}
                      accessibilityRole="button"
                      accessibilityLabel={`Tốc độ ${speed}x`}
                      accessibilityState={{
                        selected: (prefs?.voice_speed ?? 1) === speed,
                      }}
                      disabled={preferencesBusy}
                      onPress={() => onVoiceSpeedChange(speed)}
                      style={[
                        styles.speedOption,
                        (prefs?.voice_speed ?? 1) === speed &&
                          styles.speedOptionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.speedText,
                          (prefs?.voice_speed ?? 1) === speed &&
                            styles.speedSelected,
                        ]}
                      >
                        {speed}x
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
            <SettingRow
              icon={<Target size={19} color={colors.primary} />}
              label="Mục tiêu ôn mỗi ngày"
              description={`${prefs?.daily_review_goal ?? 15} từ/ngày`}
            />
            <SettingRow
              icon={<Gauge size={19} color={colors.primary} />}
              label="Hạn mức quét ảnh"
              description={`${user.daily_quota_left} lượt còn lại hôm nay (Gói ${user.account_tier})`}
            />
          </View>
        </>
      )}

      <View style={styles.accountActions}>
        {user && (
          <PrimaryButton
            label={
              googleLinkBusy
                ? 'Đang liên kết Google...'
                : user.google_linked
                ? 'Đã liên kết Google'
                : 'Liên kết Google'
            }
            variant="secondary"
            disabled={googleLinkBusy || user.google_linked === true}
            onPress={() => onGoogleLink()}
          />
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
      </View>
      <View style={styles.footer}>
        <Brand />
        <Text style={styles.footerText}>
          {user
            ? 'Từ đã lưu và tiến độ ôn tập được giữ an toàn trên máy chủ LensVocab.'
            : 'Chế độ khách không lưu bộ từ hoặc lịch sử. Đăng nhập để sử dụng đầy đủ tính năng.'}
        </Text>
      </View>
    </>
  );
}

function SettingRow({
  icon,
  label,
  description,
}: {
  icon: ReactNode;
  label: string;
  description: string;
}) {
  return (
    <View style={styles.menuItem}>
      <View style={styles.menuIcon}>{icon}</View>
      <View style={styles.fill}>
        <Text style={styles.menuText}>{label}</Text>
        <Text style={styles.menuHint}>{description}</Text>
      </View>
    </View>
  );
}
