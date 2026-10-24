import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { Asset } from 'react-native-image-picker';
import { ApiError } from '@/api/client/ApiError';
import type { DetectedObject, ScanResult } from '@/api/contracts';
import { scanImage, selectScanObject } from '@/api/endpoints/scanImage';
import type { ScanEntry, Screen } from '@/types/screen';

type UseScanFlowOptions = {
  navigate: (screen: Screen) => void;
  onUnauthorized: () => Promise<unknown>;
  reloadUser: () => Promise<unknown>;
  sceneId: string;
  setSceneId: (sceneId: string) => void;
  token: string | null;
};

export function useScanFlow({
  navigate,
  onUnauthorized,
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
  const generation = useRef(0);
  const selecting = useRef(false);
  const [selectingObject, setSelectingObject] = useState(false);

  const currentToken = useRef(token);
  const previousToken = useRef(token);
  currentToken.current = token;

  useEffect(() => {
    if (previousToken.current !== token) setScanning(false);
    previousToken.current = token;
  }, [token]);

  const selectImage = (picked: Asset | null) => {
    generation.current += 1;
    selecting.current = false;
    setSelectingObject(false);
    setScanning(false);
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

    const requestToken = token;
    const version = ++generation.current;
    setScanning(true);
    try {
      const result = await scanImage(token, asset);
      if (
        currentToken.current !== requestToken ||
        version !== generation.current
      )
        return;
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
      if (
        currentToken.current !== requestToken ||
        version !== generation.current
      )
        return;
      if (error instanceof ApiError && error.status === 401) {
        await onUnauthorized();
        return;
      }
      Alert.alert(
        'Không thể quét ảnh',
        error instanceof Error ? error.message : 'Vui lòng thử lại.',
      );
    } finally {
      if (
        currentToken.current === requestToken &&
        version === generation.current
      )
        setScanning(false);
    }
  };

  const selectObject = async (item: DetectedObject) => {
    if (
      !scanResult ||
      !item.selection_token ||
      selecting.current ||
      item.object_id === scanResult.selected_object_id
    )
      return;
    selecting.current = true;
    setSelectingObject(true);
    const version = ++generation.current;
    const requestToken = token;
    const original = scanResult;
    try {
      const selected = await selectScanObject(token, item.selection_token);
      if (
        version !== generation.current ||
        currentToken.current !== requestToken
      )
        return;
      setScanResult({
        ...selected,
        detected_objects: original.detected_objects,
      });
    } catch (error) {
      if (
        version !== generation.current ||
        currentToken.current !== requestToken
      )
        return;
      if (error instanceof ApiError && error.status === 401)
        await onUnauthorized();
      else
        Alert.alert(
          'Chưa chọn được vật',
          error instanceof Error ? error.message : 'Vui lòng thử lại.',
        );
    } finally {
      if (version === generation.current) {
        selecting.current = false;
        setSelectingObject(false);
      }
    }
  };

  const openHistory = (entry: ScanEntry) => {
    generation.current += 1;
    selecting.current = false;
    setSelectingObject(false);
    setSceneId(entry.sceneId);
    setImageUri(entry.imageUri ?? null);
    setScanResult(entry.result ?? null);
    navigate('results');
  };

  const resetScan = useCallback(() => {
    generation.current += 1;
    selecting.current = false;
    setSelectingObject(false);
    setAsset(null);
    setHistory([]);
    setImageUri(null);
    setScanResult(null);
    setScanning(false);
  }, []);

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
    selectObject,
    selectingObject,
    setImageUri,
  };
}
