import { createStyles } from '@/theme/styles';
import { Image, Pressable, Text } from 'react-native';
import { getScene } from '@/data/getScene';
import { sceneImage } from '@/theme/sceneImage';

export function SceneThumbnail({
  id,
  onPress,
  selected,
}: {
  id: string;
  onPress: () => void;
  selected?: boolean;
}) {
  const { styles } = useStyles();
  const scene = getScene(id);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chọn cảnh ${scene.title}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.sceneChoice,
        selected && styles.sceneSelected,
        pressed && styles.pressed,
      ]}
    >
      <Image source={sceneImage(id)} style={styles.sceneThumb} />
      <Text style={styles.sceneLabel} numberOfLines={1}>
        {scene.title}
      </Text>
    </Pressable>
  );
}

const useStyles = createStyles(({ colors, font }) => ({
  sceneChoice: {
    width: 110,
    backgroundColor: colors.surface,
    padding: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sceneSelected: { borderColor: colors.primaryText },
  sceneThumb: { height: 68, width: '100%', borderRadius: 10 },
  sceneLabel: {
    fontSize: font.size.badge,
    fontWeight: font.weight.bold,
    textAlign: 'center',
    marginTop: 7,
    color: colors.text,
  },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
}));
