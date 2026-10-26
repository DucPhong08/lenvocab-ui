import { Image, Text, View } from 'react-native';
import { Lightbulb, Sparkles } from 'lucide-react-native';
import { CardImage } from '@/components/CardImage';
import { CropPreview, ObjectPicker } from '@/components/ObjectPicker';
import { scanWord } from '@/api/mappers/scanWord';
import { Eyebrow } from '@/components/Eyebrow';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { TopBar } from '@/components/TopBar';
import { WordRow } from '@/components/WordRow';
import { getScene } from '@/data/getScene';
import { sceneImage } from '@/theme/sceneImage';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { styles } from './styles';

export function ResultsScreen({
  navigate,
  token,
  sceneId,
  imageUri,
  saved,
  toggleSaved,
  openWord,
  scanResult,
  user,
  saving,
  cards,
  wordForId,
  selectObject,
  selectingObject = false,
  currentScanSaved = false,
}: ScreenProps) {
  const scene = getScene(sceneId);
  const scanId = scanResult ? scanWord(scanResult).id : null;
  const words = scanId ? [wordForId(scanId)] : scene.words;
  const isStored = (id: string) =>
    saved.includes(id) ||
    !!(
      scanResult &&
      id.startsWith('scan:') &&
      cards.some(
        card =>
          card.keyword.toLowerCase() === scanResult.keyword?.toLowerCase(),
      )
    );
  const unsaved = words.filter(word => !isStored(word.id));
  const choices =
    scanResult?.detected_objects.filter(
      item => item.bounding_box && item.selection_token,
    ) ?? [];
  if (scanResult && scanId && imageUri && choices.length && selectObject) {
    const word = words[0];
    const existing = isStored(word.id);
    return (
      <>
        <TopBar title="Chọn vật muốn học" onBack={() => navigate('camera')} />
        <ObjectPicker
          uri={imageUri}
          objects={choices}
          selectedId={scanResult.selected_object_id}
          busy={saving || selectingObject}
          onSelect={selectObject}
        />
        {currentScanSaved && word.imageStyle === 'sticker' ? (
          <CardImage
            imageUrl={word.imageUrl}
            cardId={word.userFlashcardId}
            token={token}
            isSticker
            label={`Sticker đã lưu: ${word.term}`}
          />
        ) : scanResult.bounding_box ? (
          <CropPreview uri={imageUri} box={scanResult.bounding_box} />
        ) : null}
        <WordRow
          word={currentScanSaved ? word : { ...word, imageUrl: null }}
          token={token}
          saved={existing}
          disabled={selectingObject || saving}
          onOpen={() => openWord(word.id)}
        />
        <Text style={styles.resultInfoCaption}>
          {currentScanSaved
            ? 'Sticker đã lưu. Bạn có thể chọn thêm vật khác trong ảnh.'
            : 'Lưu để tách nền và thêm viền trắng. Mỗi từ giữ một sticker.'}
        </Text>
        <PrimaryButton
          label={
            saving
              ? 'Đang tạo sticker...'
              : selectingObject
              ? 'Đang chọn vật...'
              : currentScanSaved
              ? 'Xem sticker đã lưu'
              : existing
              ? 'Đổi sticker của thẻ đã lưu'
              : 'Lưu thẻ với sticker'
          }
          disabled={saving || selectingObject}
          style={styles.actionTop12}
          onPress={() =>
            currentScanSaved ? openWord(word.id) : toggleSaved(scanId)
          }
        />
      </>
    );
  }
  return (
    <>
      <TopBar
        title={scanResult ? 'Kết quả quét AI' : 'Kết quả minh họa'}
        onBack={() => navigate('camera')}
      />
      <View style={styles.resultImageWrap}>
        <Image
          source={imageUri ? { uri: imageUri } : sceneImage(sceneId)}
          style={styles.resultImage}
          resizeMode="cover"
          accessibilityLabel={imageUri ? 'Ảnh đã chọn' : scene.title}
        />
        <View style={styles.resultOverlay}>
          <Eyebrow light>
            {scanResult
              ? 'ẢNH CỦA BẠN · QUÉT AI'
              : imageUri
              ? 'ẢNH CỦA BẠN · TỪ MẪU'
              : 'CẢNH MẪU · TỪ MẪU'}
          </Eyebrow>
          <Text style={styles.resultImageTitle}>
            {imageUri ? 'Khám phá qua ảnh' : scene.title}
          </Text>
        </View>
      </View>
      <View style={styles.resultInfo}>
        <View style={styles.resultInfoIcon}>
          <Sparkles size={21} color={colors.forest} />
        </View>
        <View style={styles.fill}>
          <Text style={styles.resultInfoTitle}>
            {words.length} từ vựng để khám phá
          </Text>
          <Text style={styles.resultInfoCaption}>
            Chạm vào một từ để tìm hiểu thêm
          </Text>
        </View>
      </View>
      <View style={styles.notice}>
        <Lightbulb size={18} color={colors.forest} />
        <Text style={styles.noticeText}>
          {scanResult
            ? `Từ chính được nhận diện: ${scanResult.keyword}. Lưu thẻ để giữ lại từ và ảnh của bạn.`
            : 'Các câu ví dụ và từ trong cảnh này là nội dung minh họa, không được tạo từ ảnh của bạn.'}
        </Text>
      </View>
      <SectionHeader
        kicker={scanResult ? 'TỪ ĐƯỢC NHẬN DIỆN' : 'TỪ TRONG CẢNH MẪU'}
        title="Khám phá từng từ"
      />
      {words.map(word => (
        <WordRow
          key={word.id}
          word={word}
          token={token}
          saved={isStored(word.id)}
          disabled={selectingObject || saving}
          onOpen={() => openWord(word.id)}
          onSave={
            scanId && !saving && !isStored(word.id)
              ? () => toggleSaved(scanId)
              : undefined
          }
        />
      ))}
      <PrimaryButton
        label={
          saving
            ? 'Đang lưu...'
            : !scanResult
            ? 'Chọn ảnh thật để tạo thẻ'
            : !user
            ? 'Đăng nhập để lưu từ'
            : scanResult
            ? unsaved.length
              ? 'Lưu từ vào tài khoản'
              : 'Xem từ đã lưu'
            : 'Chọn ảnh thật để quét AI'
        }
        disabled={saving}
        onPress={() => {
          if (scanId && unsaved.length) {
            toggleSaved(scanId);
            return;
          }
          navigate(!scanResult ? 'camera' : !user ? 'auth' : 'saved');
        }}
        style={styles.actionTop12}
      />
    </>
  );
}
