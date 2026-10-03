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
import { allWords, getScene, scenes } from './data';
import { scanWord } from './api';
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
  user,
  due,
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
          <Text style={styles.avatarText}>{(user?.display_name || user?.email || 'K')[0].toUpperCase()}</Text>
        </Pressable>
      </View>
      <View style={styles.greeting}>
        <Eyebrow>MỖI NGÀY MỘT ĐIỀU MỚI</Eyebrow>
        <Text style={styles.greetingTitle}>Chào {user?.display_name || 'bạn'},{'\n'}hôm nay học gì?</Text>
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
        {user ? 'ẢNH THẬT · NHẬN DIỆN AI' : 'CHẾ ĐỘ KHÁCH · QUÉT ẢNH THẬT, KHÔNG LƯU BỘ TỪ'}
      </Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Bookmark size={18} color={colors.forest} />
          </View>
          <View>
            <Text style={styles.statValue}>{saved.length} từ</Text>
            <Text style={styles.statLabel}>{user ? 'Trong tài khoản' : 'Đăng nhập để lưu'}</Text>
          </View>
        </View>
        <View style={styles.statSeparator} />
        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Camera size={18} color={colors.forest} />
          </View>
          <View>
            <Text style={styles.statValue}>{user ? `${user.daily_quota_left} lượt` : `${history.length} lần`}</Text>
            <Text style={styles.statLabel}>{user ? 'Quét còn hôm nay' : 'Quét phiên này'}</Text>
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
          <Text style={styles.reviewSubtitle}>{user ? `${due.length} từ cần ôn hôm nay` : 'Thử bộ thẻ minh họa'}</Text>
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
          onSave={saved.includes(word.id) ? undefined : () => toggleSaved(word.id)}
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
  selectImage,
  scan,
  scanning,
  user,
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
      const picked = result.assets?.[0];
      if (picked?.type && !['image/jpeg', 'image/png'].includes(picked.type)) {
        Alert.alert('Định dạng chưa hỗ trợ', 'Chọn ảnh JPG hoặc PNG để quét.');
        return;
      }
      if (picked?.fileSize && picked.fileSize > 5 * 1024 * 1024) {
        Alert.alert('Ảnh quá lớn', 'Hãy chọn ảnh JPG/PNG không quá 5 MB.');
        return;
      }
      if (picked?.uri) selectImage(picked);
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
            {imageUri ? 'Ảnh sẽ được quét bằng AI · không lưu nếu chưa đăng nhập' : 'Chọn ảnh để quét, hoặc khám phá cảnh mẫu'}
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

export function WordScreen({
  navigate,
  wordId,
  wordBack,
  saved,
  toggleSaved,
  wordForId,
  user,
  scanResult,
  saving,
  cards,
}: ScreenProps) {
  const word = wordForId(wordId);
  const scene = getScene(word.scene);
  const isSaved = saved.includes(word.id) || !!(scanResult && word.id.startsWith('scan:') && cards.some(card => card.keyword.toLowerCase() === scanResult.keyword?.toLowerCase()));
  return (
    <View style={styles.page}>
      <TopBar
        title="Khám phá từ vựng"
        onBack={() => navigate(wordBack)}
        action={isSaved ? <Bookmark size={21} color={colors.forest} fill={colors.lime} /> : <IconButton label="Lưu từ" onPress={() => toggleSaved(word.id)} icon={<Bookmark size={21} color={colors.forest} />} />}
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
          <Text style={styles.exampleVietnamese}>{word.id.startsWith('scan:') || word.id.includes('-') && word.id.length > 30 ? `“${word.translation}”` : word.translation}</Text>
        </View>
      </View>
      <View style={styles.detailBlock}>
        <Eyebrow>GHI NHỚ NHANH</Eyebrow>
        <View style={styles.tip}>
          <Lightbulb size={20} color={colors.forest} />
          <Text style={styles.tipText}>{word.note}</Text>
        </View>
      </View>
      {!word.id.startsWith('scan:') && !(word.id.includes('-') && word.id.length > 30) && <View style={styles.detailBlock}>
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
      </View>}
      <PrimaryButton
        label={saving ? 'Đang lưu...' : isSaved ? 'Đã lưu trên tài khoản' : user && scanResult && word.id.startsWith('scan:') ? 'Lưu vào tài khoản' : user ? 'Quét ảnh để tạo từ mới' : 'Đăng nhập để lưu từ'}
        disabled={saving || isSaved}
        onPress={() => user && !scanResult ? navigate('camera') : toggleSaved(word.id)}
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
  objectList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  objectTag: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  objectTagText: { color: colors.forest, fontSize: 12, fontWeight: '700' },
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
