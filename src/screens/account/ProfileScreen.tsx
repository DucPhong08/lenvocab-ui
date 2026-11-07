import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  Bookmark,
  Download,
  Clock3,
  Gauge,
  Headphones,
  Sparkles,
  Target,
  Languages,
} from 'lucide-react-native';
import { useI18n } from '@/i18n';
import { Brand } from '@/components/Brand';
import { Eyebrow } from '@/components/Eyebrow';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import type { ScreenProps } from '@/types/screen';
import { useStyles } from './styles/styles';
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
  const { styles, colors } = useStyles();
  const { strings, locale, setLocale } = useI18n();
  const prefs = user?.preferences;
  const displayName =
    user?.display_name?.trim() ||
    user?.username ||
    (user ? strings.profile.learner : strings.profile.guest);

  return (
    <>
      <ScreenTitle
        kicker={strings.profile.kicker}
        title={strings.profile.title}
        subtitle={
          user
            ? strings.profile.userSubtitle
            : strings.profile.guestSubtitle
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
              : strings.profile.guestIdentitySub}
          </Text>
        </View>
      </View>

      <View style={styles.profileStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalSaved}</Text>
          <Text style={styles.statCaption}>{strings.profile.savedCountCaption}</Text>
        </View>
        <View style={styles.verticalLine} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statCaption}>{strings.profile.sessionScansCaption}</Text>
        </View>
        {user && (
          <>
            <View style={styles.verticalLine} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user.daily_quota_left}</Text>
              <Text style={styles.statCaption}>{strings.profile.dailyQuotaCaption}</Text>
            </View>
          </>
        )}
      </View>

      <Eyebrow>{strings.profile.learningEyebrow}</Eyebrow>
      <View style={styles.menu}>
        <MenuItem
          label={strings.profile.savedWords}
          icon={<Bookmark size={19} color={colors.primaryText} />}
          onPress={() => navigate('saved')}
        />
        <MenuItem
          label={strings.profile.scanHistory}
          icon={<Clock3 size={19} color={colors.primaryText} />}
          onPress={() => navigate('history')}
        />
        <MenuItem
          label={strings.profile.appIntro}
          icon={<Sparkles size={19} color={colors.primaryText} />}
          onPress={() => navigate('onboarding')}
        />
        <MenuItem
          label={locale === 'vi' ? 'Ngôn ngữ: Tiếng Việt' : 'Language: English'}
          icon={<Languages size={19} color={colors.primaryText} />}
          onPress={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
        />
      </View>

      {user && (
        <>
          <MenuItem
            label={strings.offline.title}
            icon={<Download size={19} color={colors.primaryText} />}
            onPress={() => navigate('sync')}
          />
          <Eyebrow>{strings.profile.voiceSettings}</Eyebrow>
          <View style={styles.menu}>
            <SettingRow
              icon={<Headphones size={19} color={colors.primaryText} />}
              label={strings.profile.standardVoice}
              description={prefs?.preferred_voice_id ?? 'Joanna'}
            />

            <View style={styles.menuItem}>
              <View style={styles.fill}>
                <Text style={styles.menuText}>{strings.profile.voiceSpeed}</Text>
                <View style={styles.speedOptions}>
                  {[0.75, 1, 1.25].map(speed => (
                    <Pressable
                      key={speed}
                      accessibilityRole="button"
                      accessibilityLabel={strings.profile.voiceSpeedLabel.replace('{speed}', String(speed))}
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
              icon={<Target size={19} color={colors.primaryText} />}
              label="Mục tiêu ôn mỗi ngày"
              description={`${prefs?.daily_review_goal ?? 15} từ/ngày`}
            />
            <SettingRow
              icon={<Gauge size={19} color={colors.primaryText} />}
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
                ? strings.profile.googleLinking
                : user.google_linked
                ? strings.profile.googleLinked
                : strings.profile.googleLink
            }
            variant="secondary"
            disabled={googleLinkBusy || user.google_linked === true}
            onPress={() => onGoogleLink()}
          />
        )}
        {user ? (
          <PrimaryButton
            label={strings.profile.logout}
            variant="secondary"
            onPress={() => onLogout()}
          />
        ) : (
          <PrimaryButton
            label={strings.profile.loginToSync}
            onPress={() => navigate('auth')}
          />
        )}
      </View>
      <View style={styles.footer}>
        <Brand />
        <Text style={styles.footerText}>
          {user
            ? strings.profile.footerUser
            : strings.profile.footerGuest}
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
  const { styles } = useStyles();
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
