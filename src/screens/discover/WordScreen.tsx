import { Image, Pressable, Text, View } from 'react-native';
import { ArrowRight, Bookmark, Lightbulb, Volume2 } from 'lucide-react-native';
import { CropPreview } from '@/components/ObjectPicker';
import { CardImage } from '@/components/CardImage';
import { CardPhoto } from '@/components/CardPhoto';
import { Eyebrow } from '@/components/Eyebrow';
import { IconButton } from '@/components/IconButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopBar } from '@/components/TopBar';
import { getScene } from '@/data/getScene';
import { sceneImage } from '@/theme/sceneImage';
import { colors } from '@/theme/theme';
import { useAudio } from '@/hooks/useAudio';
import type { ScreenProps } from '@/types/screen';
import { styles } from './styles';

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
  currentScanSaved = false,
}: ScreenProps) {
  const word = wordForId(wordId);
  const scene = getScene(word.scene);
  const { play } = useAudio();
  const isSaved =
    saved.includes(word.id) ||
    !!(
      scanResult &&
      word.id.startsWith('scan:') &&
      cards.some(
        card =>
          card.keyword.toLowerCase() === scanResult.keyword?.toLowerCase(),
      )
    );
  const canUpdateSticker =
    word.id.startsWith('scan:') && !!scanResult && isSaved && !currentScanSaved;
  return (
    <View style={styles.page}>
      <TopBar
        title="Khám phá từ vựng"
        onBack={() => navigate(wordBack)}
        action={
          <View style={styles.topBarActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                word.audio || word.userFlashcardId
                  ? 'Phát âm từ'
                  : 'Không có audio'
              }
              onPress={() => play(word.audio, word.userFlashcardId)}
              style={[
                styles.audioBtn,
                !(word.audio || word.userFlashcardId) &&
                  styles.audioBtnDisabled,
              ]}
              disabled={!(word.audio || word.userFlashcardId)}
            >
              <Volume2
                size={20}
                color={
                  word.audio || word.userFlashcardId
                    ? colors.forest
                    : colors.subtle
                }
              />
            </Pressable>
            {isSaved ? (
              <Bookmark size={21} color={colors.forest} fill={colors.lime} />
            ) : (
              <IconButton
                label="Lưu từ"
                onPress={() => toggleSaved(word.id)}
                icon={<Bookmark size={21} color={colors.forest} />}
              />
            )}
          </View>
        }
      />
      <View style={styles.wordFeature}>
        {word.imageStyle === 'sticker' && word.imageUrl ? (
          <CardImage
            imageUrl={word.imageUrl}
            cardId={word.userFlashcardId}
            token={token}
            isSticker
            variant="sticker"
            label={`Sticker của bạn: ${word.term}`}
          />
        ) : null}
        <View style={styles.levelPill}>
          <Text style={styles.levelText}>
            {word.level} · {word.type.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.bigWord} adjustsFontSizeToFit numberOfLines={1}>
          {word.term}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Phát âm"
          onPress={() => play(word.audio, word.userFlashcardId)}
          disabled={!(word.audio || word.userFlashcardId)}
          style={styles.ipaRow}
        >
          <Volume2
            size={14}
            color={
              word.audio || word.userFlashcardId ? colors.forest : colors.subtle
            }
          />
          <Text style={styles.ipa}>{word.ipa}</Text>
        </Pressable>
        <Text style={styles.wordWatermark}>Aa.</Text>
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
        <Eyebrow>NGHĨA TIẾNG VIỆT</Eyebrow>
        <Text style={styles.meaning}>{word.meaning}</Text>
      </View>
      <View style={styles.detailBlock}>
        <Eyebrow>TRONG MỘT CÂU</Eyebrow>
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
        <Eyebrow>GHI NHỚ NHANH</Eyebrow>
        <View style={styles.tip}>
          <Lightbulb size={20} color={colors.forest} />
          <Text style={styles.tipText}>{word.note}</Text>
        </View>
      </View>
      {!word.id.startsWith('scan:') &&
        !(word.id.includes('-') && word.id.length > 30) && (
          <View style={styles.detailBlock}>
            <Eyebrow>TỪ NÀY CÓ TRONG</Eyebrow>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigate('results')}
              style={styles.source}
            >
              <Image source={sceneImage(scene.id)} style={styles.sourceImage} />
              <View style={styles.fill}>
                <Text style={styles.sourceTitle}>{scene.title}</Text>
                <Text style={styles.sourceCaption}>{scene.category}</Text>
              </View>
              <ArrowRight size={18} color={colors.forest} />
            </Pressable>
          </View>
        )}
      <PrimaryButton
        label={
          saving
            ? 'Đang lưu...'
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
          user && !scanResult ? navigate('camera') : toggleSaved(word.id)
        }
        icon={
          <Bookmark
            size={19}
            color={colors.surface}
            fill={isSaved ? colors.lime : 'none'}
          />
        }
      />
    </View>
  );
}
