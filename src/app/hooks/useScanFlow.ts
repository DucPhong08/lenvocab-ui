import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { Asset } from 'react-native-image-picker';
import type { ScanResult } from '@/api/contracts';
import { scanImage } from '@/api/endpoints/scanImage';
import type { ScanEntry, Screen } from '@/types/screen';

type UseScanFlowOptions = {
  navigate: (screen: Screen) => void;
  reloadUser: () => Promise<unknown>;
  sceneId: string;
  setSceneId: (sceneId: string) => void;
  token: string | null;
};

export function useScanFlow({
  navigate,
  reloadUser,
  sceneId,
  setSceneId,
  token,
}: UseScanFlowOptions) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const scanId = useRef(0);

  const selectImage = (picked: Asset | null) => {
    setAsset(picked);
    setImageUri(picked?.uri ?? null);
    setScanResult(null);
  };

  const scan = async () => {
    if (scanning) return;
    if (!asset) {
      setScanResult(null);
      navigate('results');
      return;
    }

    setScanning(true);
    try {
      const result = await scanImage(token, asset);
      if (result.status === 'AI_COULD_NOT_RECOGNIZE' || !result.keyword) {
        Alert.alert(
          'Chưa nhận diện được',
          result.message ??
            'Thử ảnh rõ hơn, đủ sáng và có vật thể ở giữa khung hình.',
        );
        return;
      }

      setScanResult(result);
      if (token) reloadUser().catch(() => {});
      setHistory(current => [
        {
          id: ++scanId.current,
          timestamp: Date.now(),
          sceneId,
          imageUri: imageUri ?? undefined,
          result,
        },
        ...current,
      ]);
      navigate('results');
    } catch (error) {
      Alert.alert(
        'Không thể quét ảnh',
        error instanceof Error ? error.message : 'Vui lòng thử lại.',
      );
    } finally {
      setScanning(false);
    }
  };

  const openHistory = (entry: ScanEntry) => {
    setSceneId(entry.sceneId);
    setImageUri(entry.imageUri ?? null);
    setScanResult(entry.result ?? null);
    navigate('results');
  };

  const resetScan = () => {
    setAsset(null);
    setHistory([]);
    setImageUri(null);
    setScanResult(null);
  };

  return {
    asset,
    history,
    imageUri,
    openHistory,
    resetScan,
    scan,
    scanning,
    scanResult,
    selectImage,
    setImageUri,
  };
}
