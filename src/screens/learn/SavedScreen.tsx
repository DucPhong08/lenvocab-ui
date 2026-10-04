import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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

type FilterType = 'all' | 'new' | 'reviewed';

export function SavedScreen({
  navigate,
  saved,
  cards,
  user,
  loadingData,
  openWord,
  dataError,
  reloadData,
}: ScreenProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const allWords = cards.map(cardWord);

  const filteredWords = allWords.filter(word => {
    // Tìm kiếm theo từ hoặc nghĩa
    const matchesQuery = `${word.term} ${word.meaning}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase());
    if (!matchesQuery) return false;

    // Lọc theo trạng thái ôn tập SM-2
    if (filter === 'new') return (word.repetitions ?? 0) === 0;
    if (filter === 'reviewed') return (word.repetitions ?? 0) > 0;
    return true;
  });

  return (
    <View style={styles.page}>
      <ScreenTitle
        kicker="BỘ SƯU TẬP CỦA BẠN"
        title="Từ vựng đã lưu."
        subtitle={
          user
            ? 'Những từ đã đồng bộ lên tài khoản và lên lịch ôn qua thuật toán SM-2.'
            : 'Đăng nhập để lưu và đồng bộ từ vựng của bạn.'
        }
      />

      <View style={styles.countCard}>
        <BookOpen size={22} color={colors.forest} />
        <Text style={styles.countText}>{saved.length} từ vựng</Text>
        <Text style={styles.countSub}>đang được cá nhân hóa lịch ôn</Text>
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

      {/* Filter Chips */}
      {cards.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filters, styles.filterRow]}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => setFilter('all')}
            style={[styles.filter, filter === 'all' && styles.filterActive]}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'all' && styles.filterTextActive,
              ]}
            >
              Tất cả ({cards.length})
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setFilter('new')}
            style={[styles.filter, filter === 'new' && styles.filterActive]}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'new' && styles.filterTextActive,
              ]}
            >
              Từ mới ({cards.filter(c => (c.repetitions ?? 0) === 0).length})
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setFilter('reviewed')}
            style={[
              styles.filter,
              filter === 'reviewed' && styles.filterActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'reviewed' && styles.filterTextActive,
              ]}
            >
              Đang ôn ({cards.filter(c => (c.repetitions ?? 0) > 0).length})
            </Text>
          </Pressable>
        </ScrollView>
      )}

      <SectionHeader
        kicker="DANH SÁCH TỪ"
        title={`${filteredWords.length} từ được tìm thấy`}
      />

      {user && dataError ? (
        <EmptyState
          title="Không thể tải kho từ"
          description={dataError}
          onPress={() => reloadData()}
          action="Thử lại"
        />
      ) : user && loadingData ? (
        <Text style={styles.hint}>Đang tải kho từ của bạn...</Text>
      ) : filteredWords.length ? (
        filteredWords.map(word => (
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
              ? 'Hãy thử tìm bằng từ khác hoặc chuyển bộ lọc về "Tất cả".'
              : user
              ? 'Quét một ảnh thật và xác nhận thẻ để lưu trên tài khoản.'
              : 'Đăng nhập để giữ lại từ vựng giữa các lần mở ứng dụng.'
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
