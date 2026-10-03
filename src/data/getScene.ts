import { scenes } from './scenes';

export const getScene = (id: string) =>
  scenes.find(scene => scene.id === id) ?? scenes[0];
