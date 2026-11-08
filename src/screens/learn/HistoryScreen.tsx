import { Image, Pressable, Text, View } from 'react-native';
import { ArrowRight, BookOpen } from 'lucide-react-native';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import { SectionHeader } from '@/components/SectionHeader';
import { getScene } from '@/data/getScene';
import { sceneImage } from '@/theme/sceneImage';
import { useI18n } from '@/i18n';
import type { ScreenProps } from '@/types/screen';
import { useStyles } from './styles/styles';

export function HistoryScreen({ navigate, history, openHistory }: ScreenProps) {
  const { styles, colors } = useStyles();
  const { strings, locale } = useI18n();
  return (
    <>
      <ScreenTitle
        kicker={strings.history.kicker}
        title={strings.history.title}
        subtitle={strings.history.subtitle}
      />
      <View style={styles.countCard}>
        <BookOpen size={22} color={colors.primaryText} />
        <Text style={styles.countText}>{strings.history.countText(history.length)}</Text>
      </View>
      <SectionHeader kicker={strings.history.recentKicker} title={strings.history.sessionTitle} />
      {history.length ? (
        history.map(entry => {
          const scene = getScene(entry.sceneId, locale);
          return (
            <Pressable
              key={entry.id}
              accessibilityRole="button"
              accessibilityLabel={locale === 'vi' ? `Xem kết quả ${scene.title}` : `View result ${scene.title}`}
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
                  {new Date(entry.timestamp).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                    day: 'numeric',
                    month: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.historyTitle}>
                  {entry.imageUri ? strings.history.yourPhoto : scene.title}
                </Text>
                <Text style={styles.historyCaption}>
                  {entry.result
                    ? strings.history.scannedKeyword(entry.result.keyword || '')
                    : strings.history.sampleCategory(scene.words.length, scene.category)}
                </Text>
              </View>
              <ArrowRight size={17} color={colors.muted} />
            </Pressable>
          );
        })
      ) : (
        <EmptyState
          title={strings.history.emptyTitle}
          description={strings.history.emptyDescription}
          onPress={() => navigate('camera')}
          action={strings.history.startDiscover}
        />
      )}
      {history.length > 0 && (
        <PrimaryButton
          label={strings.history.discoverMore}
          onPress={() => navigate('camera')}
          style={styles.actionTop18}
        />
      )}
    </>
  );
}
