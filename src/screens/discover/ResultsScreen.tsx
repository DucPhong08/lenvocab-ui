import { Image, Text, View } from 'react-native';
import { Lightbulb, Sparkles } from 'lucide-react-native';
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
  sceneId,
  imageUri,
  saved,
  toggleSaved,
  openWord,
  scanResult,
  user,
  saving,
  cards,
}: ScreenProps) {
  const scene = getScene(sceneId);
  const words = scanResult ? [scanWord(scanResult)] : scene.words;
  const isStored = (id: string) => saved.includes(id) || !!(scanResult && id.startsWith('scan:') && cards.some(card => card.keyword.toLowerCase() === scanResult.keyword?.toLowerCase()));
  const unsaved = words.filter(word => !isStored(word.id));
  return (
    <View style={styles.page}>
      <TopBar title={scanResult ? 'Kết quả quét AI' : 'Kết quả minh họa'} onBack={() => navigate('camera')} />
      <View style={styles.resultImageWrap}>
        <Image
          source={imageUri ? { uri: imageUri } : sceneImage(sceneId)}
          style={styles.resultImage}
          resizeMode="cover"
          accessibilityLabel={imageUri ? 'Ảnh đã chọn' : scene.title}
        />
        <View style={styles.resultOverlay}>
          <Eyebrow light>
            {scanResult ? 'ẢNH CỦA BẠN · QUÉT AI' : imageUri ? 'ẢNH CỦA BẠN · TỪ MẪU' : 'CẢNH MẪU · TỪ MẪU'}
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
          {scanResult ? `Nhận diện: ${scanResult.keyword}. ${scanResult.detected_objects?.length ?? 0} vật thể được tìm thấy. Backend hiện trả về một flashcard nháp mỗi lượt quét.` : 'Các câu ví dụ và từ trong cảnh này là nội dung minh họa, không được tạo từ ảnh của bạn.'}
        </Text>
      </View>
      {scanResult && scanResult.detected_objects?.length > 0 && <View style={styles.objectList}>
        {scanResult.detected_objects.map((object, index) => (
          <View key={`${object.keyword}-${index}`} style={styles.objectTag}>
            <Text style={styles.objectTagText}>{object.keyword} · {Math.round(object.confidence <= 1 ? object.confidence * 100 : object.confidence)}%</Text>
          </View>
        ))}
      </View>}
      <SectionHeader kicker={scanResult ? 'TỪ ĐƯỢC NHẬN DIỆN' : 'TỪ TRONG CẢNH MẪU'} title="Khám phá từng từ" />
      {words.map(word => (
        <WordRow
          key={word.id}
          word={word}
          saved={isStored(word.id)}
          onOpen={() => openWord(word.id)}
          onSave={isStored(word.id) ? undefined : () => toggleSaved(word.id)}
        />
      ))}
      <PrimaryButton
        label={saving ? 'Đang lưu...' : !user ? 'Đăng nhập để lưu từ' : scanResult ? (unsaved.length ? 'Lưu từ vào tài khoản' : 'Xem từ đã lưu') : 'Chọn ảnh thật để quét AI'}
        disabled={saving}
        onPress={() => !user ? navigate('auth') : !scanResult ? navigate('camera') : unsaved.length ? toggleSaved(unsaved[0].id) : navigate('saved')}
        style={styles.actionTop12}
      />
    </View>
  );
}
