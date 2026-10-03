import { sceneImages } from './sceneImages';

export const sceneImage = (id: string) =>
  sceneImages[id] ?? sceneImages.desk;

