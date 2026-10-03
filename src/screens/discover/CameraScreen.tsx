import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Camera, Clock3, ImagePlus, RotateCcw, Sparkles } from 'lucide-react-native';
import { IconButton } from '@/components/IconButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import { TopBar } from '@/components/TopBar';
import { getScene } from '@/data/getScene';
import { scenes } from '@/data/scenes';
import { sceneImage } from '@/theme/sceneImage';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { SceneThumbnail } from './components/SceneThumbnail';
import { useImagePicker } from './hooks/useImagePicker';
import { styles } from './styles';

export function CameraScreen({
  navigate,
  sceneId,
  setSceneId,
  imageUri,
  selectImage,
  scan,
  scanning,
  user,
}: ScreenProps) {
  const scene = getScene(sceneId);
  const pickImage = useImagePicker(selectImage);
  return (
    <View style={styles.page}>
      <TopBar
        title="Quét thế giới"
        onBack={() => navigate('home')}
        action={
          <IconButton
            label="Lịch sử quét"
            onPress={() => navigate('history')}
            icon={<Clock3 size={20} color={colors.ink} />}
          />
        }
      />
      <ScreenTitle
        kicker="NHÌN · CHỤP · HỌC"
        title={'Mọi thứ đều có thể\nthành bài học.'}
        subtitle="Chụp ảnh, chọn từ thư viện hoặc thử với một khung cảnh mẫu."
      />
      <View style={styles.cameraPhoto}>
        <Image
          source={imageUri ? { uri: imageUri } : sceneImage(sceneId)}
          style={styles.cameraImage}
          resizeMode="cover"
          accessibilityLabel={imageUri ? 'Ảnh của bạn' : scene.title}
        />
        <View style={styles.cameraTag}>
          <Text style={styles.cameraTagText}>
            {imageUri ? 'ẢNH CỦA BẠN' : 'CẢNH MẪU'}
          </Text>
        </View>
        <View style={styles.cameraHint}>
          <Sparkles size={16} color={colors.surface} />
          <Text style={styles.cameraHintText}>
            {imageUri ? 'Ảnh sẽ được quét bằng AI · không lưu nếu chưa đăng nhập' : 'Chọn ảnh để quét, hoặc khám phá cảnh mẫu'}
          </Text>
        </View>
      </View>
      <View style={styles.captureRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chọn ảnh từ thư viện"
          onPress={() => pickImage('library')}
          style={styles.captureSide}
        >
          <ImagePlus size={23} color={colors.forest} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chụp ảnh bằng máy ảnh"
          onPress={() => pickImage('camera')}
          style={styles.shutter}
        >
          <Camera size={28} color={colors.surface} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dùng cảnh mẫu"
          onPress={() => selectImage(null)}
          style={styles.captureSide}
        >
          <RotateCcw size={22} color={colors.forest} />
        </Pressable>
      </View>
      <Text style={styles.cameraCaption}>
        {imageUri
          ? user ? 'Đã chọn ảnh · nhấn Quét ảnh bằng AI' : 'Đã chọn ảnh · khách có 3 lượt quét thử mỗi ngày'
          : 'Chọn cảnh mẫu để xem từ minh họa, không cần tài khoản'}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scenePicker}
      >
        {scenes.map(item => (
          <SceneThumbnail
            key={item.id}
            id={item.id}
            selected={!imageUri && item.id === sceneId}
            onPress={() => {
              setSceneId(item.id);
              selectImage(null);
            }}
          />
        ))}
      </ScrollView>
      <PrimaryButton
        label={scanning ? 'Đang nhận diện ảnh...' : imageUri ? 'Quét ảnh bằng AI' : 'Xem từ vựng minh họa'}
        disabled={scanning}
        onPress={scan}
        style={styles.actionTop20}
      />
    </View>
  );
}
