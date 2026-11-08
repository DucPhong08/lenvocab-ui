import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { cardWord } from '@/api/mappers/cardWord';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import { WordGrid } from '@/components/WordGrid';
import { useI18n } from '@/i18n';
import type { ScreenProps } from '@/types/screen';
import { useStyles } from './styles/styles';

type Filter = 'all' | 'new' | 'reviewed';

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
  const { styles, colors } = useStyles();
  const { strings } = useI18n();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const searching = !!query.trim() || filter !== 'all';

  const filters = [
    { id: 'all' as const, label: strings.saved.filterAll },
    { id: 'new' as const, label: strings.saved.filterNew },
    { id: 'reviewed' as const, label: strings.saved.filterReviewed },
  ];

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
    <>
      <ScreenTitle
        title={strings.saved.screenTitle}
        subtitle={
          user
            ? strings.saved.userSubtitle
            : strings.saved.guestSubtitle
        }
      />
      {!user ? (
        <EmptyState
          title={strings.saved.emptyGuestTitle}
          description={strings.saved.emptyGuestDescription}
          action={strings.saved.loginAction}
          onPress={() => navigate('auth')}
        />
      ) : (
        <>
          <View style={styles.libraryTop}>
            <Text style={styles.countText}>{strings.saved.countText(totalSaved)}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                searchOpen ? strings.saved.closeSearch : strings.saved.openSearch
              }
              accessibilityState={{ expanded: searchOpen }}
              style={styles.clearSearch}
              onPress={() => {
                resetFilters();
                setSearchOpen(!searchOpen);
              }}
            >
              {searchOpen ? (
                <X size={22} color={colors.primaryText} />
              ) : (
                <Search size={22} color={colors.primaryText} />
              )}
            </Pressable>
          </View>
          {searchOpen && (
            <>
              <View style={styles.search}>
                <Search size={20} color={colors.muted} />
                <TextInput
                  accessibilityLabel={strings.saved.searchAccessibility}
                  placeholder={strings.saved.searchPlaceholder}
                  placeholderTextColor={colors.muted}
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
                    accessibilityLabel={strings.saved.clearSearch}
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
            </>
          )}
          {dataError && cards.length > 0 && (
            <View>
              <Text style={styles.hint}>
                {strings.saved.syncWarning}
              </Text>
              <PrimaryButton
                label={strings.saved.reloadLibrary}
                variant="secondary"
                onPress={() => reloadData().catch(() => {})}
              />
            </View>
          )}
          {((loadingData && cards.length > 0) || findingMore) && (
            <Text accessibilityLiveRegion="polite" style={styles.hint}>
              {findingMore
                ? strings.saved.findingMore
                : strings.saved.syncingLibrary}
            </Text>
          )}
          {dataError && cards.length === 0 ? (
            <EmptyState
              title={strings.saved.loadErrorTitle}
              description={dataError}
              onPress={() => reloadData().catch(() => {})}
              action={strings.saved.retryAction}
            />
          ) : loadingData && cards.length === 0 ? (
            <Text style={styles.hint}>{strings.saved.loadingLibrary}</Text>
          ) : words.length ? (
            <>
              <Text style={styles.listCaption}>
                {searching
                  ? (findingMore ? strings.saved.matchingLoaded(words.length) : strings.saved.matchingCount(words.length))
                  : strings.saved.loadedProgress(cards.length, Math.max(totalSaved, cards.length))}
              </Text>
              <WordGrid words={words} token={token} onOpen={openWord} />
            </>
          ) : findingMore ? null : (
            <EmptyState
              title={
                searching ? strings.saved.noMatchTitle : strings.saved.noCardsTitle
              }
              description={
                searching
                  ? strings.saved.noMatchDescription
                  : strings.saved.noCardsDescription
              }
              onPress={searching ? resetFilters : () => navigate('camera')}
              action={searching ? strings.saved.clearSearchAndFilters : strings.saved.startScanAction}
            />
          )}
          {hasMoreCards && (
            <PrimaryButton
              label={loadingMoreCards ? strings.saved.loadingMore : strings.saved.viewMore}
              disabled={loadingMoreCards}
              variant="secondary"
              onPress={() => loadMoreCards().catch(() => {})}
              style={styles.actionTop20}
            />
          )}
          {cards.length > 0 && (
            <PrimaryButton
              label={strings.saved.practiceLibrary}
              onPress={() => navigate('review')}
              style={styles.actionTop20}
            />
          )}
        </>
      )}
    </>
  );
}
