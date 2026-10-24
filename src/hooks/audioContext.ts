import { createContext } from 'react';

export const AudioContext = createContext<{
  token: string | null;
  speed: number;
  onUnauthorized?: () => Promise<unknown>;
}>({ token: null, speed: 1 });
