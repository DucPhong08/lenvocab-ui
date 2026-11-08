import vi from '../../../assets/locales/preferences.vi.json';
import en from '../../../assets/locales/preferences.en.json';
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
  onPreferencesChange,
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
  const limits = user?.preference_limits;
  const copy = locale === 'vi' ? vi : en;
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
          user ? strings.profile.userSubtitle : strings.profile.guestSubtitle
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
          <Text style={styles.statCaption}>
            {strings.profile.savedCountCaption}
          </Text>
        </View>
        <View style={styles.verticalLine} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statCaption}>
            {strings.profile.sessionScansCaption}
          </Text>
        </View>
        {user && (
          <>
            <View style={styles.verticalLine} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user.daily_quota_left}</Text>
              <Text style={styles.statCaption}>
                {strings.profile.dailyQuotaCaption}
              </Text>
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
          <Eyebrow>{copy.title}</Eyebrow>
          <View style={styles.menu}>
            <SettingRow
              icon={<Headphones size={19} color={colors.primaryText} />}
              label={strings.profile.standardVoice}
              description={prefs?.preferred_voice_id ?? 'Joanna'}
            />

            <PreferenceChoices
              label={strings.profile.voiceSpeed}
              values={limits?.allowed_speeds ?? [0.75, 1, 1.25]}
              selected={prefs?.voice_speed ?? 1}
              format={speed => `${speed}x`}
              disabled={preferencesBusy}
              onChange={onVoiceSpeedChange}
            />
            {user.scan_settings && (
              <PreferenceChoices
                label={copy.objects}
                hint={copy.effective
                  .replace(
                    '{requested}',
                    String(prefs?.max_detected_objects ?? 5),
                  )
                  .replace(
                    '{count}',
                    String(user.scan_settings.max_detected_objects),
                  )}
                values={Array.from(
                  { length: user.scan_settings.max_allowed_objects },
                  (_, i) => i + 1,
                )}
                selected={prefs?.max_detected_objects ?? 5}
                format={String}
                disabled={preferencesBusy || !onPreferencesChange}
                onChange={value =>
                  onPreferencesChange?.({ max_detected_objects: value })
                }
              />
            )}
            {limits && onPreferencesChange ? (
              <PreferenceChoices
                label={copy.goal}
                hint={
                  limits.effective_daily_review_goal !== undefined
                    ? copy.reviewLimit.replace(
                        '{count}',
                        String(limits.effective_daily_review_goal),
                      )
                    : undefined
                }
                values={[
                  ...new Set([
                    5,
                    10,
                    15,
                    20,
                    30,
                    50,
                    100,
                    prefs?.daily_review_goal ?? 15,
                  ]),
                ]
                  .filter(value => value <= limits.max_daily_review_goal)
                  .sort((a, b) => a - b)}
                selected={prefs?.daily_review_goal ?? 15}
                format={String}
                disabled={preferencesBusy}
                onChange={value =>
                  onPreferencesChange({ daily_review_goal: value })
                }
              />
            ) : (
              <SettingRow
                icon={<Target size={19} color={colors.primaryText} />}
                label={copy.goal}
                description={`${prefs?.daily_review_goal ?? 15}`}
              />
            )}
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
          {user ? strings.profile.footerUser : strings.profile.footerGuest}
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

function PreferenceChoices({
  label,
  hint,
  values,
  selected,
  format,
  disabled,
  onChange,
}: {
  label: string;
  hint?: string;
  values: number[];
  selected: number;
  format: (value: number) => string;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const { styles } = useStyles();
  return (
    <View style={styles.menuItem}>
      <View style={styles.fill}>
        <Text style={styles.menuText}>{label}</Text>
        {!!hint && <Text style={styles.menuHint}>{hint}</Text>}
        <View style={styles.speedOptions}>
          {values.map(value => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${format(value)}`}
              accessibilityState={{ selected: selected === value, disabled }}
              disabled={disabled || selected === value}
              onPress={() => onChange(value)}
              style={[
                styles.speedOption,
                selected === value && styles.speedOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.speedText,
                  selected === value && styles.speedSelected,
                ]}
              >
                {format(value)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
