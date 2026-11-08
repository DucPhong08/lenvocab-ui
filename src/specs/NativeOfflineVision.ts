import { TurboModuleRegistry, type TurboModule } from 'react-native';

export type Detection = {
  labelId: number;
  label: string;
  score: number;
  box: { left: number; top: number; width: number; height: number };
};
export type DetectionResult = {
  width: number;
  height: number;
  elapsedMs: number;
  objects: Detection[];
};
export interface Spec extends TurboModule {
  detect(
    uri: string,
    minScore: number,
    maxResults: number,
  ): Promise<DetectionResult>;
}
export default TurboModuleRegistry.get<Spec>('NativeOfflineVision');
