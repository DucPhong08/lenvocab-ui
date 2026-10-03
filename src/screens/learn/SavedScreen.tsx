import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { BookOpen, Search } from 'lucide-react-native';
import { cardWord } from '@/api/mappers/cardWord';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import { SectionHeader } from '@/components/SectionHeader';
import { WordRow } from '@/components/WordRow';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { styles } from './styles';

export function SavedScreen({ navigate, saved, cards, user, loadingData, openWord }: ScreenProps) {
  const [query, setQuery] = useState('');
  const words = cards.map(cardWord).filter(word => `${word.term} ${word.meaning}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return (
    <View style={styles.page}>
      <ScreenTitle
        kicker="BỘ SƯU TẬP CỦA BẠN"
        title="Từ vựng đã lưu."
        subtitle={user ? 'Những từ đã đồng bộ lên tài khoản của bạn.' : 'Đăng nhập để lưu và đồng bộ từ vựng của bạn.'}
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

      <SectionHeader
        kicker="DANH SÁCH TỪ"
        title={`${words.length} từ được tìm thấy`}
      />
      {user && loadingData ? (
        <Text style={styles.hint}>Đang tải kho từ của bạn...</Text>
      ) : words.length ? (
        words.map(word => (
          <WordRow
            key={word.id}
            word={word}
            saved
            onOpen={() => openWord(word.id)}
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
              : user ? 'Quét một ảnh thật và xác nhận thẻ để lưu trên tài khoản.' : 'Đăng nhập để giữ lại từ vựng giữa các lần mở ứng dụng.'
          }
          onPress={() => navigate(user ? 'camera' : 'auth')}
          action={user ? 'Bắt đầu quét ảnh' : 'Đăng nhập'}
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
