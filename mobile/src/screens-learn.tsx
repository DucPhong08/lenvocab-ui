import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  Layers3,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react-native';
import { allWords, getScene, getWord } from './data';
import {
  colors,
  EmptyState,
  Eyebrow,
  PrimaryButton,
  sceneImage,
  ScreenTitle,
  SectionHeader,
  TopBar,
  WordRow,
  type ScreenProps,
} from './ui';

const filters = ['Tất cả', 'Đồ vật', 'Đời sống', 'Ngoài trời'];
export function SavedScreen({
  navigate,
  saved,
  toggleSaved,
  openWord,
}: ScreenProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Tất cả');
  const words = allWords
    .filter(word => saved.includes(word.id))
    .filter(word => {
      const category = getScene(word.scene).category;
      const inCategory =
        filter === 'Tất cả' ||
        (filter === 'Đồ vật'
          ? ['Không gian sống', 'Học tập'].includes(category)
          : category === filter);
      return (
        inCategory &&
        `${word.term} ${word.meaning}`
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase())
      );
    });
  return (
    <View style={styles.page}>
      <ScreenTitle
        kicker="BỘ SƯU TẬP CỦA BẠN"
        title="Từ vựng đã lưu."
        subtitle="Một góc nhỏ lưu lại những điều bạn đã học trong phiên này."
      />
      <View style={styles.countCard}>
        <BookOpen size={22} color={colors.forest} />
        <Text style={styles.countText}>{saved.length} từ vựng</Text>
        <Text style={styles.countSub}>đang chờ bạn ôn tập</Text>
      </View>
      <View style={styles.search}>
        <Search size={20} color={colors.muted} />
        <TextInput
          accessibilityLabel="Tìm từ vựng"
          placeholder="Tìm từ vựng..."
          placeholderTextColor={colors.subtle}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {filters.map(item => (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === item }}
            onPress={() => setFilter(item)}
            style={[styles.filter, filter === item && styles.filterActive]}
          >
            <Text
              style={[
                styles.filterText,
                filter === item && styles.filterTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <SectionHeader
        kicker="DANH SÁCH TỪ"
        title={`${words.length} từ được tìm thấy`}
      />
      {words.length ? (
        words.map(word => (
          <WordRow
            key={word.id}
            word={word}
            saved
            onOpen={() => openWord(word.id)}
            onSave={() => toggleSaved(word.id)}
          />
        ))
      ) : (
        <EmptyState
          title={
            saved.length ? 'Không tìm thấy từ phù hợp' : 'Bạn chưa lưu từ nào'
          }
          description={
            saved.length
              ? 'Hãy thử tìm bằng từ khác hoặc đổi bộ lọc.'
              : 'Khám phá cảnh mẫu, rồi lưu những từ bạn thích.'
          }
          onPress={() => navigate('camera')}
          action="Khám phá cảnh mẫu"
        />
      )}
      {saved.length > 0 && (
        <PrimaryButton
          label="Ôn tập bằng flashcard"
          onPress={() => navigate('flashcards')}
          style={styles.actionTop20}
        />
      )}
    </View>
  );
}

export function ReviewScreen({ navigate, saved }: ScreenProps) {
  return (
    <View style={styles.page}>
      <ScreenTitle
        kicker="LUYỆN TẬP MỖI NGÀY"
        title={'Một chút hôm nay.\nNhớ mãi mai sau.'}
        subtitle="Chọn cách học phù hợp với bạn nhé."
      />
      <View style={styles.progressCard}>
        <Eyebrow light>TIẾN ĐỘ PHIÊN NÀY</Eyebrow>
        <Text style={styles.progressTitle}>Cứ tiếp tục nhé!</Text>
        <Text style={styles.progressSubtitle}>
          {saved.length
            ? `Bạn có ${saved.length} từ sẵn sàng để ôn tập.`
            : 'Lưu vài từ hoặc thử ngay với bộ từ mẫu.'}
        </Text>
        <View style={styles.progressDecoration}>
          <Layers3 size={30} color={colors.lime} />
        </View>
      </View>
      <SectionHeader kicker="CHỌN CÁCH HỌC" title="Cùng bắt đầu nào" />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Bắt đầu Flashcards"
        onPress={() => navigate('flashcards')}
        style={[styles.modeCard, styles.flashMode]}
      >
        <View style={styles.modeArt}>
          <Text style={styles.modeArtText}>Aa.</Text>
        </View>
        <View style={styles.fill}>
          <Eyebrow>01 / GHI NHỚ</Eyebrow>
          <Text style={styles.modeTitle}>Flashcards</Text>
          <Text style={styles.modeDescription}>
            Lật thẻ, ghi nhớ từ theo nhịp của bạn.
          </Text>
          <Text style={styles.modeLink}>
            {saved.length ? `${saved.length} từ đã lưu` : 'Bộ từ mẫu'} →
          </Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Bắt đầu Quiz nhanh"
        onPress={() => navigate('quiz')}
        style={[styles.modeCard, styles.quizMode]}
      >
        <View style={[styles.modeArt, styles.quizArt]}>
          <CircleHelp size={34} color={colors.forest} />
        </View>
        <View style={styles.fill}>
          <Eyebrow>02 / THỬ THÁCH</Eyebrow>
          <Text style={styles.modeTitle}>Quiz nhanh</Text>
          <Text style={styles.modeDescription}>
            Kiểm tra xem bạn nhớ được bao nhiêu.
          </Text>
          <Text style={styles.modeLink}>4 câu hỏi →</Text>
        </View>
      </Pressable>
      <Text style={styles.quote}>
        “Little by little, a little becomes a lot.”
      </Text>
    </View>
  );
}

export function FlashcardsScreen({ navigate, saved }: ScreenProps) {
  const words = saved.length ? saved.map(getWord) : allWords.slice(0, 4);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = words[index % words.length];
  const next = () => {
    setIndex(value => (value + 1) % words.length);
    setFlipped(false);
  };
  return (
    <View style={styles.page}>
      <TopBar
        title="Flashcards"
        onBack={() => navigate('review')}
        action={
          <Text style={styles.counter}>
            {index + 1}/{words.length}
          </Text>
        }
      />
      <ScreenTitle
        kicker="LẬT THẺ ĐỂ KHÁM PHÁ"
        title={'Từng từ một,\ntiến xa hơn.'}
      />
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: words.length, now: index + 1 }}
        style={styles.progressTrack}
      >
        <View
          style={[
            styles.progressFill,
            { width: `${((index + 1) / words.length) * 100}%` },
          ]}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          flipped
            ? `Nghĩa là ${word.meaning}. Chạm để xem tiếng Anh`
            : `${word.term}. Chạm để xem nghĩa tiếng Việt`
        }
        onPress={() => setFlipped(value => !value)}
        style={({ pressed }) => [
          styles.flashcard,
          flipped && styles.flippedCard,
          pressed && { opacity: 0.88 },
        ]}
      >
        <View style={styles.flashcardTop}>
          <Text style={styles.flashcardSmall}>
            {flipped ? 'NGHĨA CỦA TỪ' : `TỪ SỐ ${index + 1}`}
          </Text>
          <Sparkles size={22} color={flipped ? colors.forest : colors.lime} />
        </View>
        <View style={styles.flashcardCenter}>
          <Text style={styles.flashcardType}>
            {flipped ? word.term : word.type}
          </Text>
          <Text
            adjustsFontSizeToFit
            numberOfLines={2}
            style={[styles.flashcardWord, flipped && { color: colors.forest }]}
          >
            {flipped ? word.meaning : word.term}
          </Text>
          <Text
            style={[
              styles.flashcardExample,
              flipped && { color: colors.muted },
            ]}
          >
            {flipped ? word.example : word.ipa}
          </Text>
        </View>
        <View style={styles.flipPrompt}>
          <RotateCcw size={14} color={flipped ? colors.forest : colors.lime} />
          <Text
            style={[styles.flashcardSmall, flipped && { color: colors.forest }]}
          >
            Chạm để lật thẻ
          </Text>
        </View>
      </Pressable>
      <Text style={styles.hint}>
        {flipped
          ? 'Sẵn sàng cho từ tiếp theo?'
          : 'Hãy thử nhớ nghĩa của từ trước khi lật nhé.'}
      </Text>
      <PrimaryButton label="Từ tiếp theo" onPress={next} />
      <Pressable
        accessibilityRole="button"
        onPress={() => navigate('quiz')}
        style={styles.textAction}
      >
        <Text style={styles.textActionLabel}>Thử sức với Quiz</Text>
        <ArrowRight size={16} color={colors.forest} />
      </Pressable>
    </View>
  );
}

export function QuizScreen({
  navigate,
  scrollToEnd,
  scrollToTop,
}: ScreenProps) {
  const questions = allWords.slice(0, 4);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (selected) {
      const timer = setTimeout(scrollToEnd, 100);
      return () => clearTimeout(timer);
    }
  }, [selected, scrollToEnd]);
  const word = questions[index];
  const options = [
    word,
    questions[(index + 1) % 4],
    questions[(index + 2) % 4],
    questions[(index + 3) % 4],
  ].sort((a, b) => (a.id.charCodeAt(0) % 5) - (b.id.charCodeAt(0) % 5));
  if (done)
    return (
      <View style={styles.page}>
        <TopBar title="Kết quả Quiz" onBack={() => navigate('review')} />
        <View style={styles.finish}>
          <View style={styles.finishIcon}>
            <Sparkles size={32} color={colors.forest} />
          </View>
          <Eyebrow>HOÀN THÀNH RỒI</Eyebrow>
          <Text style={styles.finishTitle}>Bạn làm tốt lắm!</Text>
          <Text style={styles.finishDescription}>
            Mỗi lần thử là một lần bạn nhớ từ lâu hơn.
          </Text>
          <View style={styles.score}>
            <Text style={styles.scoreValue}>
              {score}/{questions.length}
            </Text>
            <Text style={styles.scoreCaption}>câu đúng</Text>
          </View>
          <PrimaryButton
            label="Thử lại"
            onPress={() => {
              setIndex(0);
              setScore(0);
              setSelected(null);
              setDone(false);
              scrollToTop();
            }}
            style={styles.stretch}
          />
          <PrimaryButton
            label="Quay về ôn tập"
            variant="secondary"
            onPress={() => navigate('review')}
            style={styles.stretch}
          />
        </View>
      </View>
    );
  return (
    <View style={styles.page}>
      <TopBar
        title="Quiz nhanh"
        onBack={() => navigate('review')}
        action={
          <Text style={styles.counter}>
            {index + 1}/{questions.length}
          </Text>
        }
      />
      <ScreenTitle
        kicker={`CÂU HỎI ${index + 1}`}
        title="Từ này có nghĩa là gì?"
        subtitle="Chọn đáp án đúng nhất nhé."
      />
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: questions.length, now: index + 1 }}
        style={styles.progressTrack}
      >
        <View
          style={[
            styles.progressFill,
            { width: `${((index + 1) / questions.length) * 100}%` },
          ]}
        />
      </View>
      <View style={styles.question}>
        <Text style={styles.questionLabel}>ENGLISH WORD</Text>
        <Text style={styles.questionWord}>{word.term}</Text>
        <Text style={styles.questionIpa}>{word.ipa}</Text>
      </View>
      <View style={styles.answerList}>
        {options.map((option, i) => {
          const correct = option.id === word.id;
          const chosen = selected === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ disabled: !!selected, selected: chosen }}
              accessibilityLabel={`${String.fromCharCode(65 + i)}. ${
                option.meaning
              }${
                selected && correct
                  ? ', đáp án đúng'
                  : selected && chosen
                  ? ', chưa đúng'
                  : ''
              }`}
              disabled={!!selected}
              onPress={() => {
                setSelected(option.id);
                if (correct) setScore(value => value + 1);
              }}
              style={[
                styles.answer,
                selected && correct && styles.answerCorrect,
                selected && chosen && !correct && styles.answerWrong,
              ]}
            >
              <View style={styles.answerLetter}>
                <Text style={styles.answerLetterText}>
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text style={styles.answerText}>{option.meaning}</Text>
              {selected && correct && (
                <CheckCircle2 size={21} color={colors.success} />
              )}
              {selected && chosen && !correct && (
                <X size={21} color={colors.error} />
              )}
            </Pressable>
          );
        })}
      </View>
      {selected && (
        <View
          accessibilityLiveRegion="polite"
          style={[
            styles.feedback,
            selected === word.id && styles.feedbackCorrect,
          ]}
        >
          <Text style={styles.feedbackText}>
            {selected === word.id
              ? 'Chính xác! Bạn đang làm rất tốt.'
              : `Gần đúng rồi! “${word.term}” nghĩa là “${word.meaning}”.`}
          </Text>
        </View>
      )}
      <PrimaryButton
        label={index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
        onPress={() => {
          if (!selected) return;
          if (index === questions.length - 1) {
            setDone(true);
            scrollToTop();
          } else {
            setIndex(value => value + 1);
            setSelected(null);
            scrollToTop();
          }
        }}
        disabled={!selected}
        style={styles.actionTop18}
      />
    </View>
  );
}

export function HistoryScreen({ navigate, history, openHistory }: ScreenProps) {
  return (
    <View style={styles.page}>
      <ScreenTitle
        kicker="NHỮNG GÌ BẠN ĐÃ THẤY"
        title="Hành trình khám phá."
        subtitle="Những cảnh bạn đã chọn trong phiên sử dụng này."
      />
      <View style={styles.countCard}>
        <BookOpen size={22} color={colors.forest} />
        <Text style={styles.countText}>{history.length} lần quét</Text>
      </View>
      <SectionHeader kicker="GẦN ĐÂY" title="Lịch sử phiên này" />
      {history.length ? (
        history.map(entry => {
          const scene = getScene(entry.sceneId);
          return (
            <Pressable
              key={entry.id}
              accessibilityRole="button"
              accessibilityLabel={`Xem kết quả ${scene.title}`}
              onPress={() => openHistory(entry)}
              style={styles.historyRow}
            >
              <Image
                source={
                  entry.imageUri
                    ? { uri: entry.imageUri }
                    : sceneImage(scene.id)
                }
                style={styles.historyImage}
              />
              <View style={styles.fill}>
                <Text style={styles.historyDate}>
                  {new Date(entry.timestamp).toLocaleString('vi-VN', {
                    day: 'numeric',
                    month: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.historyTitle}>
                  {entry.imageUri ? 'Ảnh của bạn' : scene.title}
                </Text>
                <Text style={styles.historyCaption}>
                  {scene.words.length} từ mẫu · {scene.category}
                </Text>
              </View>
              <ArrowRight size={17} color={colors.muted} />
            </Pressable>
          );
        })
      ) : (
        <EmptyState
          title="Chưa có lần quét nào"
          description="Chọn ảnh hoặc một cảnh mẫu để bắt đầu khám phá."
          onPress={() => navigate('camera')}
          action="Bắt đầu khám phá"
        />
      )}
      {history.length > 0 && (
        <PrimaryButton
          label="Khám phá thêm"
          onPress={() => navigate('camera')}
          style={styles.actionTop18}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  stretch: { alignSelf: 'stretch' },
  actionTop18: { marginTop: 18 },
  actionTop20: { marginTop: 20 },
  page: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 32 },
  countCard: {
    borderRadius: 18,
    backgroundColor: colors.pale,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  countText: { fontWeight: '800', fontSize: 16, color: colors.ink },
  countSub: { color: colors.muted, fontSize: 12, marginLeft: 'auto' },
  search: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 9,
    marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 7 },
  filters: { gap: 8, paddingBottom: 20, paddingRight: 22 },
  filter: {
    paddingHorizontal: 16,
    height: 39,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    borderColor: colors.line,
    borderWidth: 1,
  },
  filterActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  filterText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  filterTextActive: { color: colors.surface },
  progressCard: {
    backgroundColor: colors.forest,
    borderRadius: 24,
    padding: 22,
    marginBottom: 30,
    gap: 8,
    overflow: 'hidden',
  },
  progressTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.surface,
    marginTop: 4,
  },
  progressSubtitle: {
    fontSize: 13,
    color: '#D9EEE1',
    lineHeight: 20,
    maxWidth: '75%',
  },
  progressDecoration: {
    position: 'absolute',
    right: 20,
    top: 27,
    width: 67,
    height: 67,
    borderRadius: 24,
    backgroundColor: '#FFFFFF19',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    padding: 14,
    borderRadius: 21,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  flashMode: { backgroundColor: colors.pale },
  quizMode: { backgroundColor: colors.surface },
  quizArt: { backgroundColor: colors.lime },
  modeArt: {
    width: 76,
    height: 90,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeArtText: { fontSize: 28, color: colors.forest, fontWeight: '800' },
  modeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 4,
  },
  modeDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    marginTop: 4,
  },
  modeLink: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.success,
    marginTop: 9,
  },
  quote: {
    textAlign: 'center',
    color: colors.subtle,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 26,
  },
  counter: { fontSize: 13, fontWeight: '800', color: colors.forest },
  progressTrack: {
    height: 7,
    borderRadius: 6,
    backgroundColor: colors.line,
    overflow: 'hidden',
    marginBottom: 23,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 6,
  },
  flashcard: {
    height: 330,
    borderRadius: 26,
    backgroundColor: colors.forest,
    padding: 22,
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  flippedCard: { backgroundColor: colors.lime },
  flashcardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flipPrompt: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flashcardSmall: {
    fontSize: 11,
    color: colors.lime,
    fontWeight: '800',
    letterSpacing: 1,
  },
  flashcardCenter: { alignItems: 'center', gap: 13 },
  flashcardType: { color: colors.lime, fontSize: 14 },
  flashcardWord: {
    color: colors.surface,
    fontSize: 35,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 43,
  },
  flashcardExample: { color: '#D9EEE1', fontSize: 13, textAlign: 'center' },
  hint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 19,
  },
  textAction: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  textActionLabel: { fontSize: 14, fontWeight: '700', color: colors.forest },
  question: {
    backgroundColor: colors.forest,
    borderRadius: 22,
    minHeight: 139,
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginBottom: 21,
  },
  questionLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '800',
    color: colors.lime,
  },
  questionWord: { fontSize: 30, fontWeight: '800', color: colors.surface },
  questionIpa: { fontSize: 14, color: '#D9EEE1' },
  answerList: { gap: 9 },
  answer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    minHeight: 63,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  answerCorrect: { borderColor: colors.success, backgroundColor: '#E7F5E8' },
  answerWrong: { borderColor: colors.error, backgroundColor: '#FFF1ED' },
  answerLetter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.pale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerLetterText: { fontSize: 13, fontWeight: '800', color: colors.forest },
  answerText: { flex: 1, fontWeight: '700', fontSize: 14, color: colors.ink },
  feedback: {
    backgroundColor: '#FFF1ED',
    padding: 14,
    borderRadius: 15,
    marginTop: 13,
  },
  feedbackCorrect: { backgroundColor: '#E7F5E8' },
  feedbackText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.ink,
    fontWeight: '700',
  },
  finish: { paddingTop: 65, alignItems: 'center', gap: 13 },
  finishIcon: {
    width: 74,
    height: 74,
    borderRadius: 26,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  finishTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
  },
  finishDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    textAlign: 'center',
  },
  score: {
    width: 164,
    height: 164,
    borderRadius: 82,
    borderWidth: 11,
    borderColor: colors.lime,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  scoreValue: { fontSize: 36, fontWeight: '800', color: colors.forest },
  scoreCaption: { fontSize: 13, color: colors.muted },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: 17,
    padding: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
  },
  historyImage: { width: 66, height: 66, borderRadius: 12 },
  historyDate: { fontSize: 11, fontWeight: '800', color: colors.success },
  historyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 3,
  },
  historyCaption: { fontSize: 12, color: colors.muted, marginTop: 3 },
});
