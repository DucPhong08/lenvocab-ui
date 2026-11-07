import { Image, Pressable, Text, View } from 'react-native';
import { ArrowRight, Bookmark, Lightbulb } from 'lucide-react-native';
import { CropPreview } from '@/components/ObjectPicker';
import { CardImage } from '@/components/CardImage';
import { CardPhoto } from '@/components/CardPhoto';
import { Eyebrow } from '@/components/Eyebrow';
import { AudioButton } from '@/components/AudioButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopBar } from '@/components/TopBar';
import { getScene } from '@/data/getScene';
import { sceneImage } from '@/theme/sceneImage';
import { useAudio } from '@/hooks/useAudio';
import type { ScreenProps } from '@/types/screen';
import { isWordSaved } from '@/data/isWordSaved';
import { useStyles } from './styles';

export function WordScreen({
  navigate,
  token,
  reloadData,
  onLogout,
  wordId,
  wordBack,
  saved,
  toggleSaved,
  wordForId,
  user,
  scanResult,
  saving,
  cards,
  setSceneId,
  selectImage,
  currentScanSaved = false,
}: ScreenProps) {
  const { styles, colors } = useStyles();
  const word = wordForId(wordId);
  const scene = getScene(word.scene);
  const { play } = useAudio();
  const isSaved = isWordSaved(word.id, { saved, cards, scanResult });
  const isScan = wordId.startsWith('scan:') && !!scanResult;
  const isSample = !isScan && !word.userFlashcardId;
  const canUpdateSticker = isScan && isSaved && !currentScanSaved;
  return (
    <>
      <TopBar
        title="Khám phá từ vựng"
        onBack={() => navigate(wordBack)}
        action={
          isSaved ? (
            <Bookmark
              size={21}
              color={colors.primaryText}
              fill={colors.highlight}
            />
          ) : undefined
        }
      />
      {word.imageStyle === 'sticker' && word.imageUrl ? (
        <View style={styles.wordSticker}>
          <CardImage
            imageUrl={word.imageUrl}
            cardId={word.userFlashcardId}
            token={token}
            isSticker
            variant="sticker"
            label={`Sticker của bạn: ${word.term}`}
          />
        </View>
      ) : null}
      <View style={styles.wordFeature}>
        <View style={styles.levelPill}>
          <Text style={styles.levelText}>
            {word.level} · {word.type}
          </Text>
        </View>
        <Text style={styles.bigWord} adjustsFontSizeToFit numberOfLines={2}>
          {word.term}
        </Text>
        <View style={styles.ipaRow}>
          {word.ipa ? <Text style={styles.ipa}>{word.ipa}</Text> : null}
          {(word.audio || word.userFlashcardId) && (
            <AudioButton
              label="Phát âm từ"
              onPress={() => play(word.audio, word.userFlashcardId)}
            />
          )}
        </View>
      </View>
      {word.userFlashcardId ? (
        <CardPhoto
          showImage={word.imageStyle !== 'sticker'}
          cardId={word.userFlashcardId}
          imageUrl={word.imageUrl}
          hasImage={word.hasImage}
          token={token}
          term={word.term}
          onChanged={reloadData}
          onUnauthorized={onLogout}
        />
      ) : word.id.startsWith('scan:') &&
        word.imageUrl &&
        scanResult?.bounding_box ? (
        <CropPreview uri={word.imageUrl} box={scanResult.bounding_box} />
      ) : word.imageUrl && word.imageStyle !== 'sticker' ? (
        <CardImage
          imageUrl={word.imageUrl}
          label={`Ảnh của bạn: ${word.term}`}
        />
      ) : null}
      <View style={styles.detailBlock}>
        <Eyebrow>Nghĩa tiếng Việt</Eyebrow>
        <Text style={styles.meaning}>{word.meaning}</Text>
      </View>
      <View style={styles.detailBlock}>
        <Eyebrow>Dùng trong một câu</Eyebrow>
        <View style={styles.example}>
          <Text style={styles.exampleEnglish}>"{word.example}"</Text>
          {word.example2 ? (
            <Text style={styles.exampleVietnamese}>"{word.example2}"</Text>
          ) : word.translation ? (
            <Text style={styles.exampleVietnamese}>{word.translation}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.detailBlock}>
        <Eyebrow>Cách dùng cần nhớ</Eyebrow>
        <View style={styles.tip}>
          <Lightbulb size={20} color={colors.primaryText} />
          <Text style={styles.tipText}>{word.note}</Text>
        </View>
      </View>
      {isSample && (
        <View style={styles.detailBlock}>
          <Eyebrow>Khám phá trong cảnh</Eyebrow>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Xem cảnh ${scene.title}`}
            onPress={() => {
              setSceneId(word.scene);
              selectImage(null);
              navigate('results');
            }}
            style={styles.source}
          >
            <Image source={sceneImage(scene.id)} style={styles.sourceImage} />
            <View style={styles.fill}>
              <Text style={styles.sourceTitle}>{scene.title}</Text>
              <Text style={styles.sourceCaption}>{scene.category}</Text>
            </View>
            <ArrowRight size={18} color={colors.primaryText} />
          </Pressable>
        </View>
      )}
      <PrimaryButton
        label={
          saving
            ? 'Đang lưu...'
            : isSample
            ? 'Chụp ảnh để tạo thẻ của bạn'
            : canUpdateSticker
            ? 'Đổi sticker của thẻ đã lưu'
            : isSaved
            ? 'Đã lưu trên tài khoản'
            : user && scanResult && word.id.startsWith('scan:')
            ? 'Lưu vào tài khoản'
            : user
            ? 'Quét ảnh để tạo từ mới'
            : 'Đăng nhập để lưu từ'
        }
        disabled={saving || (isSaved && !canUpdateSticker)}
        onPress={() =>
          isSample ? navigate('camera') : toggleSaved(isScan ? wordId : word.id)
        }
        icon={
          <Bookmark
            size={19}
            color={colors.onPrimary}
            fill={isSaved ? colors.highlight : 'none'}
          />
        }
      />
    </>
  );
}
