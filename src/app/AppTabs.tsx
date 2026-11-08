import { Pressable, Text, View } from 'react-native';
import {
  Bookmark,
  Camera,
  Home,
  Layers3,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useI18n } from '@/i18n';
import type { Screen } from '@/types/screen';
import { useStyles } from './styles';

export function AppTabs({
  screen,
  wordBack,
  navigate,
}: {
  screen: Screen;
  wordBack: Screen;
  navigate: (next: Screen) => void;
}) {
  const { styles, colors } = useStyles();
  const { strings } = useI18n();

  const tabs: { screen: Screen; label: string; icon: LucideIcon }[] = [
    { screen: 'home', label: strings.nav.home, icon: Home },
    { screen: 'saved', label: strings.nav.saved, icon: Bookmark },
    { screen: 'camera', label: strings.nav.camera, icon: Camera },
    { screen: 'review', label: strings.nav.review, icon: Layers3 },
    { screen: 'profile', label: strings.nav.profile, icon: UserRound },
  ];
  const parent = screen === 'word' ? wordBack : screen;
  const activeTab =
    parent === 'sync'
      ? 'profile'
      : parent === 'results' ||
        parent === 'history' ||
        parent === 'offline-scan'
      ? 'camera'
      : parent === 'quiz' || parent === 'flashcards'
      ? 'review'
      : parent;

  return (
    <View accessibilityRole="tablist" style={styles.tabBar}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const active = activeTab === tab.screen;
        return (
          <Pressable
            key={tab.screen}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
            onPress={() => navigate(tab.screen)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <View
              style={[
                styles.tabIcon,
                tab.screen === 'camera' && styles.cameraTab,
                active && tab.screen !== 'camera' && styles.activeTabIcon,
              ]}
            >
              <Icon
                size={tab.screen === 'camera' ? 23 : 21}
                color={
                  tab.screen === 'camera'
                    ? colors.onPrimary
                    : active
                    ? colors.primaryText
                    : colors.muted
                }
                fill={
                  active && tab.screen === 'home' ? colors.primaryText : 'none'
                }
              />
            </View>
            <Text
              numberOfLines={2}
              adjustsFontSizeToFit
              style={[styles.tabLabel, active && styles.activeTabLabel]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
