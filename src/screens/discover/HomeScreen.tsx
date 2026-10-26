import { Pressable, Text, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import { Brand } from '@/components/Brand';
import { SectionHeader } from '@/components/SectionHeader';
import { WordGrid } from '@/components/WordGrid';
import { StudyCard } from '@/components/StudyCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import { cardWord } from '@/api/mappers/cardWord';
import { allWords } from '@/data/scenes';
import { SESSION_SIZE } from '@/data/study';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { styles } from './styles';

export function HomeScreen({
  navigate,
  token,
  openWord,
  cards,
  user,
  due,
  loadingData,
  dataError,
  reloadData,
}: ScreenProps) {
  const words = user ? cards.slice(0, 2).map(cardWord) : allWords.slice(0, 2);
  const count = Math.min(SESSION_SIZE, due.length);
  const hasCards = cards.length > 0;
  return (
    <>
      <View style={styles.homeTop}>
        <Brand />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mở hồ sơ"
          onPress={() => navigate('profile')}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {(user?.display_name || user?.username || 'K')[0].toUpperCase()}
          </Text>
        </Pressable>
      </View>
      <StudyCard
        title={
          user && count
            ? 'Nhớ lại, rồi dùng được.'
            : hasCards
            ? 'Dùng lại từ của bạn.'
            : 'Nhìn quanh. Học một từ.'
        }
        description={
          dataError
            ? 'Lịch ôn chưa đồng bộ. Bạn có thể thử tải lại bên dưới.'
            : loadingData
            ? 'Đang đồng bộ lịch ôn và kho từ của bạn.'
            : user && count
            ? `${due.length} từ đến hạn. Bắt đầu với ${count} từ thôi.`
            : hasCards
            ? 'Chưa có từ đến hạn. Thử một câu hỏi từ kho cá nhân.'
            : 'Chụp vật quen thuộc, lưu sticker cùng nghĩa và câu ví dụ.'
        }
      >
        <PrimaryButton
          variant="secondary"
          label={
            user && count
              ? `Ôn nhanh ${count} từ`
              : hasCards
              ? 'Quiz từ của bạn'
              : 'Chụp ảnh học từ'
          }
          disabled={!!user && loadingData && !hasCards}
          onPress={() =>
            navigate(
              user && count ? 'flashcards' : hasCards ? 'quiz' : 'camera',
            )
          }
        />
      </StudyCard>
      {(hasCards || count > 0) && (
        <PrimaryButton
          label="Chụp ảnh học từ"
          variant="secondary"
          icon={<Camera size={19} color={colors.forest} />}
          onPress={() => navigate('camera')}
        />
      )}
      {dataError && words.length > 0 && (
        <PrimaryButton
          label="Tải lại lịch ôn"
          variant="secondary"
          onPress={() => reloadData().catch(() => {})}
          style={styles.actionTop12}
        />
      )}
      {!user && (
        <Text style={styles.demoNote}>
          Thử ngay. Đăng nhập khi bạn muốn lưu thẻ.
        </Text>
      )}
      <SectionHeader
        title={user ? 'Gần đây của bạn' : 'Thẻ mẫu để thử'}
        action={user ? 'Mở kho từ' : 'Thử ôn mẫu'}
        onAction={() => navigate(user ? 'saved' : 'flashcards')}
      />
      <WordGrid words={words} token={token} onOpen={openWord} />
      {user && !words.length && (
        <EmptyState
          loading={loadingData}
          title={
            loadingData
              ? 'Đang tải kho từ'
              : dataError
              ? 'Chưa tải được kho từ'
              : 'Tạo thẻ đầu tiên của bạn'
          }
          description={
            dataError || 'Chụp một vật quen thuộc và lưu thẻ kèm sticker.'
          }
          action={
            loadingData
              ? undefined
              : dataError
              ? 'Tải lại kho từ'
              : 'Quét ảnh đầu tiên'
          }
          onPress={
            dataError
              ? () => reloadData().catch(() => {})
              : () => navigate('camera')
          }
        />
      )}
    </>
  );
}
