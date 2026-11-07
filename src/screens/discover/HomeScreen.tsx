import { Pressable, Text, View } from 'react-native';
import { useI18n } from '@/i18n';
import { Camera } from 'lucide-react-native';
import { Brand } from '@/components/Brand';
import { SectionHeader } from '@/components/SectionHeader';
import { WordGrid } from '@/components/WordGrid';
import { LenCamera } from '@/components/LenCamera';
import { StudyCard } from '@/components/StudyCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import { cardWord } from '@/api/mappers/cardWord';
import { allWords } from '@/data/scenes';
import { SESSION_SIZE } from '@/data/study';
import type { ScreenProps } from '@/types/screen';
import { useStyles } from './styles/styles';

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
  setSceneId,
  selectImage,
}: ScreenProps) {
  const { styles, colors } = useStyles();
  const { strings } = useI18n();
  const words = user ? cards.slice(0, 2).map(cardWord) : allWords.slice(0, 2);
  const count = Math.min(SESSION_SIZE, due.length);
  const hasCards = cards.length > 0;
  return (
    <>
      <View style={styles.homeTop}>
        <Brand />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.profile.title}
          onPress={() => navigate('profile')}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {(user?.display_name || user?.username || 'K')[0].toUpperCase()}
          </Text>
        </Pressable>
      </View>
      <Text style={styles.homeGreeting}>{strings.home.greeting}</Text>
      <Text style={styles.homeTitle}>
        {strings.home.heroTitle}
      </Text>
      <StudyCard
        label={
          user && count
            ? strings.home.dueLabel(due.length)
            : strings.home.worldLabel
        }
        illustration={<LenCamera size={96} />}
        title={
          user && count
            ? strings.home.dueTitle
            : hasCards
            ? strings.home.reuseTitle
            : strings.home.captureTitle
        }
        description={
          dataError
            ? strings.home.errorDescription
            : loadingData
            ? strings.home.loadingDescription
            : user && count
            ? strings.home.sessionDescription(count)
            : hasCards
            ? strings.home.noDueDescription
            : strings.home.captureDescription
        }
      >
        <PrimaryButton
          label={
            user && count
              ? strings.home.startDue(count)
              : hasCards
              ? strings.home.startQuiz
              : strings.home.startCamera
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
          label={strings.home.startCamera}
          variant="secondary"
          icon={<Camera size={21} color={colors.accentText} />}
          style={styles.homeCapture}
          textStyle={styles.homeCaptureText}
          onPress={() => navigate('camera')}
        />
      )}
      {dataError && words.length > 0 && (
        <PrimaryButton
          label={strings.home.reloadSchedule}
          variant="secondary"
          onPress={() => reloadData().catch(() => {})}
          style={styles.actionTop12}
        />
      )}
      {!user && (
        <Text style={styles.demoNote}>
          {strings.home.guestNote}
        </Text>
      )}
      <SectionHeader
        title={user ? strings.home.collectionTitle : strings.home.sampleCollectionTitle}
        action={user ? strings.home.openSaved : strings.home.trySample}
        onAction={() => navigate(user ? 'saved' : 'flashcards')}
      />
      <WordGrid words={words} token={token} onOpen={openWord} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.home.sampleA2B2}
        onPress={() => {
          setSceneId('desk');
          selectImage(null);
          navigate('results');
        }}
        style={styles.sampleLink}
      >
        <Text style={styles.sampleLinkText}>
          {strings.library.samples(allWords.length)}
        </Text>
      </Pressable>
      {user && !words.length && (
        <EmptyState
          loading={loadingData}
          title={
            loadingData
              ? strings.home.loadingCards
              : dataError
              ? strings.home.loadCardsError
              : strings.home.createFirstCard
          }
          description={
            dataError || strings.home.captureDescription
          }
          action={
            loadingData
              ? undefined
              : dataError
              ? strings.home.reloadCards
              : strings.home.scanFirstPhoto
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
