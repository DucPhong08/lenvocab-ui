import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Lightbulb, Sparkles } from 'lucide-react-native';
import { EmptyState } from '@/components/EmptyState';
import { CardImage } from '@/components/CardImage';
import { CropPreview, ObjectPicker } from '@/components/ObjectPicker';
import { scanWord } from '@/api/mappers/scanWord';
import { Eyebrow } from '@/components/Eyebrow';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { TopBar } from '@/components/TopBar';
import { WordRow } from '@/components/WordRow';
import { useI18n } from '@/i18n';
import { SESSION_SIZE } from '@/data/study';
import { allWords } from '@/data/scenes';
import { getScene } from '@/data/getScene';
import { sceneImage } from '@/theme/sceneImage';
import type { ScreenProps } from '@/types/screen';
import { isWordSaved } from '@/data/isWordSaved';
import { useStyles } from './styles/styles';

export function ResultsScreen({
  navigate,
  startPractice,
  token,
  sceneId,
  imageUri,
  saved,
  toggleSaved,
  openWord,
  scanResult,
  user,
  saving,
  cards,
  wordForId,
  selectObject,
  selectingObject = false,
  currentScanSaved = false,
}: ScreenProps) {
  const { styles, colors } = useStyles();
  const { strings, locale } = useI18n();
  const [level, setLevel] = useState('all');
  const scene = getScene(sceneId, locale);
  const scanId = scanResult ? scanWord(scanResult).id : null;
  const words = scanId ? [wordForId(scanId)] : scene.words;
  const isStored = (id: string) =>
    isWordSaved(id, { saved, cards, scanResult });
  const visible =
    scanId || level === 'all'
      ? words
      : words.filter(word => word.level === level);
  const practiceWords = [
    ...visible,
    ...allWords.filter(
      word =>
        word.scene !== scene.id && (level === 'all' || word.level === level),
    ),
  ];
  const unsaved = words.filter(word => !isStored(word.id));
  const choices =
    scanResult?.detected_objects.filter(
      item => item.bounding_box && item.selection_token,
    ) ?? [];
  if (scanResult && scanId && imageUri && choices.length && selectObject) {
    const word = words[0];
    const existing = isStored(word.id);
    return (
      <>
        <TopBar title={strings.results.topBarSelect} onBack={() => navigate('camera')} />
        <ObjectPicker
          uri={imageUri}
          objects={choices}
          selectedId={scanResult.selected_object_id}
          busy={saving || selectingObject}
          onSelect={selectObject}
        />
        {currentScanSaved && word.imageStyle === 'sticker' ? (
          <CardImage
            imageUrl={word.imageUrl}
            cardId={word.userFlashcardId}
            token={token}
            isSticker
            label={strings.results.savedStickerLabel(word.term)}
          />
        ) : scanResult.bounding_box ? (
          <CropPreview uri={imageUri} box={scanResult.bounding_box} />
        ) : null}
        <WordRow
          word={currentScanSaved ? word : { ...word, imageUrl: null }}
          token={token}
          saved={existing}
          disabled={selectingObject || saving}
          onOpen={() => openWord(word.id)}
        />
        <Text style={styles.resultInfoCaption}>
          {currentScanSaved
            ? strings.results.savedStickerCaption
            : strings.results.unsavedStickerCaption}
        </Text>
        <PrimaryButton
          label={
            saving
              ? strings.results.makingSticker
              : selectingObject
              ? strings.results.selectingObject
              : currentScanSaved
              ? strings.results.viewSavedSticker
              : existing
              ? strings.results.changeSticker
              : strings.results.saveCardWithSticker
          }
          disabled={saving || selectingObject}
          style={styles.actionTop12}
          onPress={() =>
            currentScanSaved ? openWord(word.id) : toggleSaved(scanId)
          }
        />
      </>
    );
  }
  return (
    <>
      <TopBar
        title={scanResult ? strings.results.topBarAi : strings.results.topBarSample}
        onBack={() => navigate('camera')}
      />
      <View
        style={[styles.resultImageWrap, !scanResult && styles.sampleSceneImage]}
      >
        <Image
          source={imageUri ? { uri: imageUri } : sceneImage(sceneId)}
          style={styles.resultImage}
          resizeMode="cover"
          accessibilityLabel={imageUri ? strings.results.selectedImageLabel : scene.title}
        />
        <View style={styles.resultOverlay}>
          <Eyebrow light>
            {scanResult
              ? strings.results.overlayUserAi
              : imageUri
              ? strings.results.overlayUserSample
              : strings.results.overlaySample}
          </Eyebrow>
          <Text style={styles.resultImageTitle}>
            {imageUri ? strings.results.explorePhoto : scene.title}
          </Text>
        </View>
      </View>
      {scanResult && (
        <View style={styles.resultInfo}>
          <View style={styles.resultInfoIcon}>
            <Sparkles size={21} color={colors.primaryText} />
          </View>
          <View style={styles.fill}>
            <Text style={styles.resultInfoTitle}>
              {strings.results.wordsToExplore(words.length)}
            </Text>
            <Text style={styles.resultInfoCaption}>
              {strings.results.tapToLearnMore}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.notice}>
        <Lightbulb size={18} color={colors.primaryText} />
        <Text style={styles.noticeText}>
          {scanResult
            ? strings.results.mainWordNotice(scanResult.keyword || '')
            : strings.results.sampleNotice}
        </Text>
      </View>
      <SectionHeader
        kicker={scanResult ? strings.results.recognizedKicker : strings.results.sampleWordsKicker}
        title={scanResult ? strings.results.exploreEachWord : strings.results.sampleCount(visible.length)}
      />
      {!scanResult && (
        <>
          <View style={styles.levelFilters}>
            {['all', 'A2', 'B1', 'B2'].map(item => (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityLabel={strings.results.filterLevel(item === 'all' ? strings.results.allLevels : item)}
                accessibilityState={{ selected: item === level }}
                onPress={() => setLevel(item)}
                style={[
                  styles.levelFilter,
                  item === level && styles.levelFilterActive,
                ]}
              >
                <Text
                  style={[
                    styles.levelFilterText,
                    item === level && styles.levelFilterTextActive,
                  ]}
                >
                  {item === 'all' ? strings.results.allLevels : item}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.levelCaption}>
            {level === 'B2'
              ? strings.results.b2Hint
              : ''}
            {visible.length > 0 && visible.length < SESSION_SIZE
              ? level === 'all'
                ? strings.results.extraSceneWords
                : strings.results.extraSceneWordsAtLevel(level)
              : ''}
            {strings.results.levelDisclaimer}
          </Text>
          {!!visible.length && (
            <PrimaryButton
              label={level === 'all'
                ? strings.results.practiceAllWords(Math.min(SESSION_SIZE, practiceWords.length))
                : strings.results.practiceLevelWords(Math.min(SESSION_SIZE, practiceWords.length), level)}
              onPress={() => startPractice(practiceWords)}
              style={styles.practiceAction}
            />
          )}
          {!visible.length && (
            <EmptyState
              title={strings.results.emptyLevelTitle}
              description={strings.results.emptyLevelDescription}
              action={strings.results.emptyLevelAction}
              onPress={() => setLevel('all')}
            />
          )}
        </>
      )}
      {visible.map(word => (
        <WordRow
          key={word.id}
          word={word}
          token={token}
          saved={isStored(word.id)}
          disabled={selectingObject || saving}
          onOpen={() => openWord(word.id)}
          onSave={
            scanId && !saving && !isStored(word.id)
              ? () => toggleSaved(scanId)
              : undefined
          }
        />
      ))}
      <PrimaryButton
        label={
          saving
            ? strings.results.saving
            : !scanResult
            ? strings.results.captureToCreateCard
            : !user
            ? strings.results.loginToSaveWord
            : unsaved.length
            ? strings.results.saveToAccount
            : strings.results.viewSavedWords
        }
        disabled={saving}
        onPress={() => {
          if (scanId && unsaved.length) {
            toggleSaved(scanId);
            return;
          }
          navigate(!scanResult ? 'camera' : !user ? 'auth' : 'saved');
        }}
        style={styles.actionTop12}
      />
    </>
  );
}
