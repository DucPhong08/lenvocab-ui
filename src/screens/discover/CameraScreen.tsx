import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Camera, Clock3, ImagePlus, RotateCcw } from 'lucide-react-native';
import { IconButton } from '@/components/IconButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import { TopBar } from '@/components/TopBar';
import { getScene } from '@/data/getScene';
import { scenes } from '@/data/scenes';
import { sceneImage } from '@/theme/sceneImage';
import { useI18n } from '@/i18n';
import type { ScreenProps } from '@/types/screen';
import { SceneThumbnail } from './components/SceneThumbnail';
import { useImagePicker } from './hooks/useImagePicker';
import { useStyles } from './styles/styles';

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
  const { styles, colors } = useStyles();
  const { strings, locale } = useI18n();
  const scene = getScene(sceneId, locale);
  const pickImage = useImagePicker(selectImage);
  return (
    <>
      <TopBar
        title={strings.camera.topBarTitle}
        onBack={() => navigate('home')}
        action={
          <IconButton
            label={strings.camera.history}
            onPress={() => navigate('history')}
            icon={<Clock3 size={20} color={colors.text} />}
          />
        }
      />
      <ScreenTitle
        title={imageUri ? strings.camera.readyTitle : strings.camera.askTitle}
        subtitle={
          imageUri
            ? undefined
            : strings.camera.askSubtitle
        }
      />
      <View style={styles.cameraPhoto}>
        <Image
          source={imageUri ? { uri: imageUri } : sceneImage(sceneId)}
          style={styles.cameraImage}
          resizeMode="contain"
          accessibilityLabel={imageUri ? strings.camera.yourPhotoLabel : scene.title}
        />
        <View style={styles.cameraTag}>
          <Text style={styles.cameraTagText}>
            {imageUri ? strings.camera.yourPhotoTag : strings.camera.sampleSceneTag}
          </Text>
        </View>
      </View>
      <View style={styles.captureRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.camera.chooseFromLibrary}
          disabled={scanning}
          accessibilityState={{ disabled: scanning }}
          onPress={() => pickImage('library')}
          style={styles.captureSide}
        >
          <ImagePlus size={23} color={colors.primaryText} />
          <Text style={styles.captureLabel}>{strings.camera.libraryBtn}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.camera.takePhoto}
          disabled={scanning}
          accessibilityState={{ disabled: scanning }}
          onPress={() => pickImage('camera')}
          style={styles.shutter}
        >
          <Camera size={28} color={colors.onPrimary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.camera.useSample}
          disabled={scanning}
          accessibilityState={{ disabled: scanning }}
          onPress={() => selectImage(null)}
          style={styles.captureSide}
        >
          <RotateCcw size={22} color={colors.primaryText} />
          <Text style={styles.captureLabel}>{strings.camera.sampleBtn}</Text>
        </Pressable>
      </View>
      <PrimaryButton
        label={
          scanning
            ? strings.camera.scanningAi
            : imageUri
            ? strings.camera.scanWithAi
            : strings.camera.viewSampleVocab
        }
        disabled={scanning}
        onPress={scan}
        style={styles.actionTop20}
      />
      <Text style={styles.cameraCaption}>
        {imageUri
          ? user
            ? strings.camera.captionUser
            : strings.camera.captionGuest
          : strings.camera.captionSample}
      </Text>
      {!imageUri && (
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
                if (scanning) return;
                setSceneId(item.id);
                selectImage(null);
              }}
            />
          ))}
        </ScrollView>
      )}
    </>
  );
}
