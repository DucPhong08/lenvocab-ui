import { createContext } from 'react';

export const EffectsContext = createContext({
  animationsEnabled: true,
  soundEnabled: true,
});
