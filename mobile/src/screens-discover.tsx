import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  ArrowRight,
  Bookmark,
  Camera,
  Check,
  Clock3,
  ImagePlus,
  Lightbulb,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';
import { allWords, getScene, getWord, scenes } from './data';
import {
  Brand,
  colors,
  Eyebrow,
  IconButton,
  PrimaryButton,
  sceneImage,
  SceneThumbnail,
  ScreenTitle,
  SectionHeader,
  shadow,
  TopBar,
  WordRow,
  type ScreenProps,
} from './ui';

export function HomeScreen({
  navigate,
  openWord,
  saved,
  toggleSaved,
  history,
}: ScreenProps) {
  return (
    <View style={styles.page}>
      <View style={styles.homeTop}>
        <Brand />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mở hồ sơ"
          onPress={() => navigate('profile')}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>A</Text>
        </Pressable>
      </View>
      <View style={styles.greeting}>
        <Eyebrow>MỖI NGÀY MỘT ĐIỀU MỚI</Eyebrow>
        <Text style={styles.greetingTitle}>Chào bạn,{'\n'}hôm nay học gì?</Text>
        <Text style={styles.description}>
          Thế giới quanh bạn luôn có điều mới để học.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Bắt đầu chọn hoặc chụp ảnh"
        onPress={() => navigate('camera')}
        style={({ pressed }) => [
          styles.hero,
          shadow,
          pressed && { opacity: 0.9 },
        ]}
      >
        <View style={styles.heroCopy}>
          <View style={styles.heroPill}>
            <Sparkles size={12} color={colors.forest} />
            <Text style={styles.heroPillText}>HỌC TỪ THẾ GIỚI THẬT</Text>
          </View>
          <Text style={styles.heroTitle}>Chụp ảnh.{'\n'}Học cả thế giới.</Text>
          <View style={styles.heroAction}>
            <Text style={styles.heroActionText}>Bắt đầu quét</Text>
            <ArrowRight size={16} color={colors.forest} />
          </View>
        </View>
        <View style={styles.heroPicture}>
          <Image source={sceneImage('desk')} style={styles.heroImage} />
          <View style={styles.heroLabel}>
            <Text style={styles.heroLabelText}>notebook</Text>
            <Check size={12} color={colors.forest} />
          </View>
        </View>
      </Pressable>
      <Text style={styles.demoNote}>
        BẢN DEMO · TỪ VỰNG ĐƯỢC MINH HỌA BẰNG CẢNH MẪU
      </Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Bookmark size={18} color={colors.forest} />
          </View>
          <View>
            <Text style={styles.statValue}>{saved.length} từ</Text>
            <Text style={styles.statLabel}>Đã lưu phiên này</Text>
          </View>
        </View>
        <View style={styles.statSeparator} />
        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Camera size={18} color={colors.forest} />
          </View>
          <View>
            <Text style={styles.statValue}>{history.length} lần</Text>
            <Text style={styles.statLabel}>Đã quét phiên này</Text>
          </View>
        </View>
      </View>
      <SectionHeader
        kicker="MỘT CHÚT MỖI NGÀY"
        title="Ôn tập hôm nay"
        action="Xem thêm"
        onAction={() => navigate('review')}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => navigate('flashcards')}
        style={({ pressed }) => [
          styles.reviewCard,
          shadow,
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.reviewArt}>
          <Text style={styles.reviewArtText}>Aa.</Text>
        </View>
        <View style={styles.reviewCopy}>
          <Text style={styles.reviewTitle}>5 phút cho trí nhớ</Text>
          <Text style={styles.reviewSubtitle}>Lật thẻ để ôn từ vựng</Text>
          <Text style={styles.reviewLink}>Bắt đầu ôn tập →</Text>
        </View>
      </Pressable>
      <SectionHeader
        title="Từ vựng quanh bạn"
        action="Tất cả"
        onAction={() => navigate('saved')}
      />
      {allWords.slice(0, 2).map(word => (
        <WordRow
          key={word.id}
          word={word}
          saved={saved.includes(word.id)}
          onOpen={() => openWord(word.id)}
          onSave={() => toggleSaved(word.id)}
        />
      ))}
    </View>
  );
}

export function CameraScreen({
  navigate,
  sceneId,
  setSceneId,
  imageUri,
  setImageUri,
  scan,
}: ScreenProps) {
  const scene = getScene(sceneId);
  const pick = async (source: 'camera' | 'library') => {
    try {
      const result =
        source === 'camera'
          ? await launchCamera({
              mediaType: 'photo',
              quality: 0.8,
              saveToPhotos: false,
            })
          : await launchImageLibrary({
              mediaType: 'photo',
              selectionLimit: 1,
              quality: 0.8,
            });
      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert(
          'Không thể mở ảnh',
          result.errorMessage ?? 'Vui lòng thử lại hoặc chọn một cảnh mẫu.',
        );
        return;
      }
      const uri = result.assets?.[0]?.uri;
      if (uri) setImageUri(uri);
    } catch {
      Alert.alert(
        'Không thể mở ảnh',
        'Kiểm tra quyền truy cập máy ảnh hoặc thư viện ảnh.',
      );
    }
  };
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
            Kết quả sẽ dùng từ vựng minh họa
          </Text>
        </View>
      </View>
      <View style={styles.captureRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chọn ảnh từ thư viện"
          onPress={() => pick('library')}
          style={styles.captureSide}
        >
          <ImagePlus size={23} color={colors.forest} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chụp ảnh bằng máy ảnh"
          onPress={() => pick('camera')}
          style={styles.shutter}
        >
          <Camera size={28} color={colors.surface} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dùng cảnh mẫu"
          onPress={() => setImageUri(null)}
          style={styles.captureSide}
        >
          <RotateCcw size={22} color={colors.forest} />
        </Pressable>
      </View>
      <Text style={styles.cameraCaption}>
        {imageUri
          ? 'Đã chọn ảnh · chạm Xem từ vựng minh họa bên dưới'
          : 'Hoặc chọn cảnh mẫu để trải nghiệm ngay'}
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
              setImageUri(null);
            }}
          />
        ))}
      </ScrollView>
      <PrimaryButton
        label="Xem từ vựng minh họa"
        onPress={scan}
        style={styles.actionTop20}
      />
    </View>
  );
}

export function ResultsScreen({
  navigate,
  sceneId,
  imageUri,
  saved,
  toggleSaved,
  openWord,
}: ScreenProps) {
  const scene = getScene(sceneId);
  const unsaved = scene.words.filter(word => !saved.includes(word.id));
  return (
    <View style={styles.page}>
      <TopBar title="Kết quả minh họa" onBack={() => navigate('camera')} />
      <View style={styles.resultImageWrap}>
        <Image
          source={imageUri ? { uri: imageUri } : sceneImage(sceneId)}
          style={styles.resultImage}
          resizeMode="cover"
          accessibilityLabel={imageUri ? 'Ảnh đã chọn' : scene.title}
        />
        <View style={styles.resultOverlay}>
          <Eyebrow light>
            {imageUri ? 'ẢNH CỦA BẠN · TỪ MẪU' : 'CẢNH MẪU · TỪ MẪU'}
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
            {scene.words.length} từ vựng để khám phá
          </Text>
          <Text style={styles.resultInfoCaption}>
            Chạm vào một từ để tìm hiểu thêm
          </Text>
        </View>
      </View>
      <View style={styles.notice}>
        <Lightbulb size={18} color={colors.forest} />
        <Text style={styles.noticeText}>
          Đây là danh sách từ vựng mẫu của cảnh {scene.title.toLowerCase()},
          chưa phải kết quả nhận diện ảnh tự động.
        </Text>
      </View>
      <SectionHeader kicker="TỪ VỰNG TRONG CẢNH MẪU" title="Khám phá từng từ" />
      {scene.words.map(word => (
        <WordRow
          key={word.id}
          word={word}
          saved={saved.includes(word.id)}
          onOpen={() => openWord(word.id)}
          onSave={() => toggleSaved(word.id)}
        />
      ))}
      <PrimaryButton
        label={
          unsaved.length ? `Lưu ${unsaved.length} từ chưa lưu` : 'Xem từ đã lưu'
        }
        onPress={() => {
          unsaved.forEach(word => toggleSaved(word.id));
          navigate('saved');
        }}
        style={styles.actionTop12}
      />
    </View>
  );
}

export function WordScreen({
  navigate,
  wordId,
  wordBack,
  saved,
  toggleSaved,
}: ScreenProps) {
  const word = getWord(wordId);
  const scene = getScene(word.scene);
  const isSaved = saved.includes(word.id);
  return (
    <View style={styles.page}>
      <TopBar
        title="Khám phá từ vựng"
        onBack={() => navigate(wordBack)}
        action={
          <IconButton
            label={isSaved ? 'Bỏ lưu từ' : 'Lưu từ'}
            onPress={() => toggleSaved(word.id)}
            icon={
              <Bookmark
                size={21}
                color={colors.forest}
                fill={isSaved ? colors.lime : 'none'}
              />
            }
          />
        }
      />
      <View style={styles.wordFeature}>
        <View style={styles.levelPill}>
          <Text style={styles.levelText}>
            {word.level} · {word.type.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.bigWord} adjustsFontSizeToFit numberOfLines={1}>
          {word.term}
        </Text>
        <Text style={styles.ipa}>{word.ipa}</Text>
        <Text style={styles.wordWatermark}>Aa.</Text>
      </View>
      <View style={styles.detailBlock}>
        <Eyebrow>NGHĨA TIẾNG VIỆT</Eyebrow>
        <Text style={styles.meaning}>{word.meaning}</Text>
      </View>
      <View style={styles.detailBlock}>
        <Eyebrow>TRONG MỘT CÂU</Eyebrow>
        <View style={styles.example}>
          <Text style={styles.exampleEnglish}>“{word.example}”</Text>
          <Text style={styles.exampleVietnamese}>{word.translation}</Text>
        </View>
      </View>
      <View style={styles.detailBlock}>
        <Eyebrow>GHI NHỚ NHANH</Eyebrow>
        <View style={styles.tip}>
          <Lightbulb size={20} color={colors.forest} />
          <Text style={styles.tipText}>{word.note}</Text>
        </View>
      </View>
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
      <PrimaryButton
        label={isSaved ? 'Bỏ lưu khỏi bộ từ' : 'Lưu vào bộ từ của tôi'}
        onPress={() => toggleSaved(word.id)}
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

const styles = StyleSheet.create({
  fill: { flex: 1 },
  reviewCopy: { flex: 1, gap: 5 },
  actionTop20: { marginTop: 20 },
  actionTop12: { marginTop: 12 },
  page: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 32 },
  homeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: colors.forest },
  greeting: { gap: 9, marginBottom: 23 },
  greetingTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -1.2,
    color: colors.ink,
  },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  hero: {
    minHeight: 226,
    borderRadius: 26,
    backgroundColor: colors.forest,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  heroCopy: { flex: 1, alignItems: 'flex-start', gap: 18, zIndex: 1 },
  heroPill: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: colors.lime,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  heroPillText: {
    color: colors.forest,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  heroTitle: {
    color: colors.surface,
    fontWeight: '800',
    fontSize: 23,
    lineHeight: 29,
    letterSpacing: -0.6,
  },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 13,
    backgroundColor: colors.lime,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  heroActionText: { fontSize: 12, fontWeight: '800', color: colors.forest },
  heroPicture: { width: '39%', alignItems: 'center', justifyContent: 'center' },
  heroImage: { width: '100%', height: 162, borderRadius: 17 },
  heroLabel: {
    position: 'absolute',
    left: -8,
    bottom: 9,
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  heroLabelText: { color: colors.forest, fontSize: 10, fontWeight: '800' },
  demoNote: {
    color: colors.subtle,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 17,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 19,
    padding: 14,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: colors.line,
  },
  stat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 },
  statIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statSeparator: {
    width: 1,
    height: 27,
    backgroundColor: colors.line,
    marginHorizontal: 5,
  },
  statValue: { fontSize: 15, fontWeight: '800', color: colors.ink },
  statLabel: { fontSize: 10, color: colors.muted, marginTop: 3 },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    gap: 15,
    borderRadius: 21,
    backgroundColor: colors.surface,
    marginBottom: 27,
  },
  reviewArt: {
    width: 74,
    height: 84,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pale,
  },
  reviewArtText: { color: colors.forest, fontSize: 29, fontWeight: '800' },
  reviewTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  reviewSubtitle: { fontSize: 12, color: colors.muted },
  reviewLink: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.success,
    marginTop: 5,
  },
  cameraPhoto: {
    height: 294,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: colors.pale,
  },
  cameraImage: { width: '100%', height: '100%' },
  cameraTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  cameraTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.forest,
    letterSpacing: 1,
  },
  cameraHint: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    backgroundColor: '#14392FE8',
    padding: 11,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cameraHintText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  captureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 29,
    alignItems: 'center',
    marginTop: 19,
  },
  captureSide: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  shutter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: colors.lime,
  },
  cameraCaption: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.muted,
    marginTop: 12,
    marginBottom: 18,
  },
  scenePicker: { gap: 8, paddingRight: 22 },
  resultImageWrap: {
    height: 226,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.pale,
    marginBottom: 16,
  },
  resultImage: { width: '100%', height: '100%' },
  resultOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#14392FDD',
    padding: 16,
    gap: 5,
  },
  resultImageTitle: { fontSize: 21, fontWeight: '800', color: colors.surface },
  resultInfo: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 13,
  },
  resultInfoIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfoTitle: { fontSize: 15, color: colors.ink, fontWeight: '800' },
  resultInfoCaption: { fontSize: 12, color: colors.muted, marginTop: 4 },
  notice: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.pale,
    borderRadius: 14,
    padding: 13,
    marginBottom: 27,
  },
  noticeText: { flex: 1, color: colors.forest, fontSize: 12, lineHeight: 19 },
  wordFeature: {
    backgroundColor: colors.forest,
    borderRadius: 25,
    padding: 23,
    minHeight: 190,
    marginBottom: 27,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 10,
  },
  levelPill: {
    borderRadius: 12,
    backgroundColor: colors.lime,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  levelText: { fontSize: 11, color: colors.forest, fontWeight: '800' },
  bigWord: {
    color: colors.surface,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    maxWidth: '100%',
  },
  ipa: { color: colors.lime, fontSize: 16 },
  wordWatermark: {
    position: 'absolute',
    right: -18,
    bottom: -35,
    fontSize: 96,
    color: '#FFFFFF13',
    fontWeight: '800',
  },
  detailBlock: { gap: 11, marginBottom: 25 },
  meaning: { color: colors.ink, fontWeight: '800', fontSize: 28 },
  example: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 17,
    gap: 11,
    borderLeftWidth: 3,
    borderLeftColor: colors.lime,
  },
  exampleEnglish: {
    fontSize: 17,
    lineHeight: 25,
    color: colors.ink,
    fontWeight: '700',
  },
  exampleVietnamese: { fontSize: 13, lineHeight: 20, color: colors.muted },
  tip: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.pale,
    borderRadius: 17,
    padding: 15,
  },
  tipText: { flex: 1, fontSize: 14, lineHeight: 21, color: colors.ink },
  source: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 10,
  },
  sourceImage: { width: 54, height: 54, borderRadius: 11 },
  sourceTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  sourceCaption: { fontSize: 12, color: colors.muted, marginTop: 4 },
});
