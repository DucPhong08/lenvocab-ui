import vi from '../../../assets/locales/offline-scan.vi.json';
import en from '../../../assets/locales/offline-scan.en.json';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Text, View, useWindowDimensions } from 'react-native';
import type { Asset } from 'react-native-image-picker';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopBar } from '@/components/TopBar';
import { useI18n } from '@/i18n';
import { createStyles } from '@/theme/styles';
import type { ScreenProps } from '@/types/screen';
import type { DetectionResult } from '@/specs/NativeOfflineVision';
import {
  detectOffline,
  offlineScanAvailable,
} from '@/services/vision/offlineDetector';
import { scanSettings } from '@/services/vision/scanSettings';
import { errorMessage } from '@/utils/errorMessage';
import labelsVi from '../../../assets/models/labels.vi.json';
import { useImagePicker } from './hooks/useImagePicker';

const text = { vi, en };

export function OfflineScanEntry({ onPress }: { onPress: () => void }) {
  const { locale } = useI18n();
  const { styles } = useStyles();
  if (!offlineScanAvailable) return null;
  return (
    <PrimaryButton
      label={text[locale].entry}
      onPress={onPress}
      variant="secondary"
      style={styles.entry}
    />
  );
}

export function OfflineScanScreen({ navigate, user, offline }: ScreenProps) {
  const { styles } = useStyles();
  const { locale } = useI18n();
  const copy = text[locale];
  const settings = scanSettings(user);
  const window = useWindowDimensions();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const request = useRef(0);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    request.current++;
    setResult(null);
    setError(null);
  }, [settings.max_detected_objects, settings.confidence_threshold, user?.id]);
  const selectImage = useCallback((photo: Asset | null) => {
    request.current++;
    setAsset(photo);
    setResult(null);
    setError(null);
  }, []);
  const pick = useImagePicker(selectImage);
  const detect = async () => {
    if (!asset || inFlight.current) return;
    const version = ++request.current;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const data = await detectOffline(asset, settings);
      if (mounted.current && request.current === version) setResult(data);
    } catch (cause) {
      if (mounted.current && request.current === version)
        setError(errorMessage(cause));
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  if (!offlineScanAvailable)
    return (
      <EmptyState
        title={copy.unavailable}
        description={copy.unavailableHint}
        action={copy.back}
        onPress={() => navigate('camera')}
      />
    );
  const width = result?.width ?? asset?.width ?? 4;
  const height = result?.height ?? asset?.height ?? 3;
  const ratio = width > 0 && height > 0 ? width / height : 4 / 3;
  const previewWidth = Math.max(
    1,
    Math.min(window.width - 48, Math.min(360, window.height * 0.42) * ratio),
  );
  return (
    <>
      <TopBar title={copy.title} onBack={() => navigate('camera')} />
      <Text style={styles.body}>
        {copy.intro
          .replace('{categories}', String(Object.keys(labelsVi).length))
          .replace('{max}', String(settings.max_detected_objects))}
      </Text>
      <Text style={styles.note}>
        {user?.scan_settings
          ? offline
            ? copy.cached
            : copy.synced
          : copy.defaults}
      </Text>
      <PrimaryButton
        label={copy.settings}
        variant="secondary"
        onPress={() => navigate('profile')}
      />
      <View style={styles.actions}>
        <PrimaryButton
          label={copy.library}
          style={styles.fill}
          variant="secondary"
          disabled={busy}
          onPress={() => pick('library')}
        />
        <PrimaryButton
          label={copy.camera}
          style={styles.fill}
          variant="secondary"
          disabled={busy}
          onPress={() => pick('camera')}
        />
      </View>
      {asset?.uri ? (
        <View
          style={[styles.photo, { aspectRatio: ratio, width: previewWidth }]}
        >
          <Image
            source={{ uri: asset.uri }}
            accessibilityLabel={copy.photo}
            style={styles.image}
            resizeMode="contain"
          />
          {result?.objects.map((item, index) => (
            <View
              key={`${item.labelId}-${index}`}
              pointerEvents="none"
              style={[
                styles.box,
                {
                  left: `${item.box.left * 100}%`,
                  top: `${item.box.top * 100}%`,
                  width: `${item.box.width * 100}%`,
                  height: `${item.box.height * 100}%`,
                },
              ]}
            >
              <Text style={styles.boxLabel}>{index + 1}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.note}>{copy.hint}</Text>
      )}
      <PrimaryButton
        label={busy ? copy.busy : copy.scan}
        onPress={detect}
        disabled={!asset || busy}
      />
      {!!error && (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      )}
      {result && (
        <View accessibilityLiveRegion="polite" style={styles.results}>
          <Text style={styles.note}>
            {result.objects.length} {locale === 'vi' ? 'vật' : 'objects'} ·{' '}
            {Math.round(result.elapsedMs)} ms
          </Text>
          {result.objects.length ? (
            result.objects.map((item, index) => (
              <Text key={`${item.labelId}-${index}`} style={styles.label}>
                {index + 1}. {item.label}
                {(user?.preferences.target_language ?? locale) === 'vi' &&
                item.label in labelsVi
                  ? ` · ${labelsVi[item.label as keyof typeof labelsVi]}`
                  : ''}{' '}
                · {Math.round(item.score * 100)}%
              </Text>
            ))
          ) : (
            <EmptyState title={copy.empty} description={copy.retry} />
          )}
        </View>
      )}
      <Text style={styles.note}>{copy.limit}</Text>
    </>
  );
}

const useStyles = createStyles(({ colors, font }) => ({
  entry: { marginBottom: 16 },
  body: { ...font.body, color: colors.text, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  fill: { flex: 1 },
  photo: {
    position: 'relative',
    alignSelf: 'center',
    maxWidth: '100%',
    width: '100%',
    backgroundColor: colors.surfaceMuted,
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 16,
  },
  image: { width: '100%', height: '100%' },
  box: { position: 'absolute', borderWidth: 3, borderColor: colors.primary },
  boxLabel: {
    ...font.note,
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    backgroundColor: colors.primary,
    color: colors.onPrimary,
  },
  note: { ...font.note, color: colors.muted, marginVertical: 12 },
  error: { ...font.body, color: colors.error, marginVertical: 12 },
  results: { gap: 12, marginTop: 12 },
  label: { ...font.label, color: colors.text },
}));
