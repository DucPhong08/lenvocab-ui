import { Pressable, Text, View } from 'react-native';
import {
  Bookmark,
  Camera,
  Home,
  Layers3,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { colors } from '@/theme/theme';
import type { Screen } from '@/types/screen';
import { styles } from './styles';

const tabs: { screen: Screen; label: string; icon: LucideIcon }[] = [
  { screen: 'home', label: 'Trang chủ', icon: Home },
  { screen: 'saved', label: 'Từ đã lưu', icon: Bookmark },
  { screen: 'camera', label: 'Quét ảnh', icon: Camera },
  { screen: 'review', label: 'Ôn tập', icon: Layers3 },
  { screen: 'profile', label: 'Cá nhân', icon: UserRound },
];

export function AppTabs({
  screen,
  wordBack,
  navigate,
}: {
  screen: Screen;
  wordBack: Screen;
  navigate: (next: Screen) => void;
}) {
  const activeTab =
    screen === 'word'
      ? wordBack === 'results'
        ? 'camera'
        : wordBack
      : screen === 'results' || screen === 'history'
        ? 'camera'
        : screen === 'quiz' || screen === 'flashcards'
          ? 'review'
          : screen;

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
                    ? colors.surface
                    : active
                      ? colors.forest
                      : colors.subtle
                }
                fill={active && tab.screen === 'home' ? colors.forest : 'none'}
              />
            </View>
            <Text
              numberOfLines={1}
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
