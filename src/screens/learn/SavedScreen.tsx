import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { BookOpen, Search, X } from 'lucide-react-native';
import { cardWord } from '@/api/mappers/cardWord';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import { WordRow } from '@/components/WordRow';
import { colors } from '@/theme/theme';
import type { ScreenProps } from '@/types/screen';
import { styles } from './styles';

const filters = [
  { id: 'all', label: 'Tất cả' },
  { id: 'new', label: 'Từ mới' },
  { id: 'reviewed', label: 'Đã ôn' },
] as const;
type Filter = (typeof filters)[number]['id'];

export function SavedScreen({
  navigate,
  token,
  totalSaved,
  hasMoreCards,
  loadingMoreCards,
  loadMoreCards,
  cards,
  user,
  loadingData,
  openWord,
  dataError,
  reloadData,
}: ScreenProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const searching = !!query.trim() || filter !== 'all';

  useEffect(() => {
    if (searching && hasMoreCards && !loadingMoreCards && !dataError)
      loadMoreCards().catch(() => {});
  }, [searching, hasMoreCards, loadingMoreCards, dataError, loadMoreCards]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const words = cards
    .filter(card => {
      if (
        !`${card.keyword} ${card.meaning_vi}`
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      )
        return false;
      if (filter === 'new') return card.repetitions === 0;
      if (filter === 'reviewed') return card.repetitions > 0;
      return true;
    })
    .map(cardWord);
  const resetFilters = () => {
    setQuery('');
    setFilter('all');
  };
  const findingMore = searching && hasMoreCards && !dataError;

  return (
    <View style={styles.page}>
      <ScreenTitle
        kicker="Bộ sưu tập của bạn"
        title="Từ vựng đã lưu"
        subtitle={
          user
            ? 'Mỗi thẻ giữ lại một điều bạn đã thấy. Tìm từ hoặc chọn thẻ để học lại.'
            : 'Đăng nhập để giữ lại từ, sticker và tiến độ học.'
        }
      />
      {!user ? (
        <EmptyState
          title="Kho từ của riêng bạn"
          description="Quét ảnh ở chế độ khách, rồi đăng nhập khi bạn muốn lưu thẻ."
          action="Đăng nhập"
          onPress={() => navigate('auth')}
        />
      ) : (
        <>
          <View style={styles.countCard}>
            <BookOpen size={22} color={colors.forest} />
            <Text style={styles.countText}>{totalSaved} từ đã lưu</Text>
          </View>
          <View style={styles.search}>
            <Search size={20} color={colors.muted} />
            <TextInput
              accessibilityLabel="Tìm từ vựng"
              placeholder="Tìm từ hoặc nghĩa"
              placeholderTextColor={colors.subtle}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!!query && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Xóa tìm kiếm"
                onPress={() => setQuery('')}
                style={styles.clearSearch}
              >
                <X size={18} color={colors.muted} />
              </Pressable>
            )}
          </View>
          {cards.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {filters.map(item => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: filter === item.id }}
                  onPress={() => setFilter(item.id)}
                  style={[
                    styles.filter,
                    filter === item.id && styles.filterActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === item.id && styles.filterTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          {dataError && cards.length > 0 && (
            <View>
              <Text style={styles.hint}>
                Chưa đồng bộ được toàn bộ kho từ. Những thẻ đã tải vẫn ở đây.
              </Text>
              <PrimaryButton
                label="Tải lại kho từ"
                variant="secondary"
                onPress={() => reloadData().catch(() => {})}
              />
            </View>
          )}
          {((loadingData && cards.length > 0) || findingMore) && (
            <Text accessibilityLiveRegion="polite" style={styles.hint}>
              {findingMore
                ? 'Đang tìm trong những từ còn lại...'
                : 'Đang đồng bộ kho từ của bạn...'}
            </Text>
          )}
          {dataError && cards.length === 0 ? (
            <EmptyState
              title="Không thể tải kho từ"
              description={dataError}
              onPress={() => reloadData().catch(() => {})}
              action="Thử lại"
            />
          ) : loadingData && cards.length === 0 ? (
            <Text style={styles.hint}>Đang tải kho từ của bạn...</Text>
          ) : words.length ? (
            <>
              <Text style={styles.listCaption}>
                {searching
                  ? `${words.length} từ phù hợp${findingMore ? ' đã tải' : ''}`
                  : `Đã tải ${cards.length} trong ${Math.max(
                      totalSaved,
                      cards.length,
                    )} từ`}
              </Text>
              {words.map(word => (
                <WordRow
                  key={word.id}
                  word={word}
                  token={token}
                  saved
                  onOpen={() => openWord(word.id)}
                />
              ))}
            </>
          ) : findingMore ? null : (
            <EmptyState
              title={
                searching ? 'Không tìm thấy từ phù hợp' : 'Bạn chưa lưu từ nào'
              }
              description={
                searching
                  ? 'Thử từ khóa khác hoặc xem lại tất cả thẻ.'
                  : 'Chụp một vật quen thuộc và lưu thẻ kèm sticker đầu tiên.'
              }
              onPress={searching ? resetFilters : () => navigate('camera')}
              action={searching ? 'Xóa tìm kiếm và bộ lọc' : 'Bắt đầu quét ảnh'}
            />
          )}
          {hasMoreCards && (
            <PrimaryButton
              label={loadingMoreCards ? 'Đang tải thêm...' : 'Xem thêm từ'}
              disabled={loadingMoreCards}
              variant="secondary"
              onPress={() => loadMoreCards().catch(() => {})}
              style={styles.actionTop20}
            />
          )}
          {cards.length > 0 && (
            <PrimaryButton
              label="Luyện tập với kho từ"
              onPress={() => navigate('review')}
              style={styles.actionTop20}
            />
          )}
        </>
      )}
    </View>
  );
}
