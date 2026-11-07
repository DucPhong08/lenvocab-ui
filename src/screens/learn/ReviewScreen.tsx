import { Text } from 'react-native';
import { useI18n } from '@/i18n';
import { EmptyState } from '@/components/EmptyState';
import { ScreenTitle } from '@/components/ScreenTitle';
import { StudyCard } from '@/components/StudyCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SESSION_SIZE } from '@/data/study';
import type { ScreenProps } from '@/types/screen';
import { useStyles } from './styles/styles';

export function ReviewScreen({
  navigate,
  totalSaved,
  cards,
  due,
  user,
  loadingData,
  dataError,
  reloadData,
}: ScreenProps) {
  const { styles } = useStyles();
  const { strings } = useI18n();
  if (loadingData)
    return (
      <EmptyState
        loading
        title={strings.review.loadingTitle}
        description={strings.review.loadingDescription}
      />
    );
  if (dataError)
    return (
      <EmptyState
        title={strings.review.loadErrorTitle}
        description={dataError}
        action={strings.common.retry}
        onPress={() => reloadData()}
      />
    );
  if (user && !totalSaved && !cards.length && !due.length)
    return (
      <EmptyState
        title={strings.review.noWordsTitle}
        description={strings.review.noWordsDescription}
        action={strings.review.scanNewWord}
        onPress={() => navigate('camera')}
      />
    );
  const done = !!user && !due.length;
  const count = user ? Math.min(SESSION_SIZE, due.length) : SESSION_SIZE;
  return (
    <>
      <ScreenTitle title={strings.review.title} subtitle={strings.review.subtitle} />
      <StudyCard
        title={done ? strings.review.notDueYet : strings.review.roundCount(count)}
        description={
          user
            ? done
              ? strings.review.quizPracticeHint
              : strings.review.waitingDueHint(due.length)
            : strings.review.sampleCardHint
        }
      >
        <PrimaryButton
          label={done ? strings.review.notDueToday : strings.review.start(count)}
          disabled={done}
          onPress={() => navigate('flashcards')}
        />
      </StudyCard>
      <PrimaryButton
        label={strings.review.quiz}
        variant="secondary"
        onPress={() => navigate('quiz')}
      />
      <Text style={styles.hint}>{strings.review.hint(SESSION_SIZE)}</Text>
    </>
  );
}
