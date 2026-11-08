import { useCallback, useContext, useEffect, useRef } from 'react';
import { playSfx, type SfxType } from '@/utils/sfx';
import { EffectsContext } from './effectsContext';
import { useForeground } from './useForeground';

export function useSoundEffects() {
  const { soundEnabled } = useContext(EffectsContext);
  const active = useForeground();
  const stop = useRef<(() => void) | undefined>(undefined);
  useEffect(
    () => () => {
      stop.current?.();
      stop.current = undefined;
    },
    [soundEnabled, active],
  );
  return useCallback(
    (type: SfxType) => {
      stop.current?.();
      stop.current = undefined;
      if (soundEnabled && active) stop.current = playSfx(type);
    },
    [soundEnabled, active],
  );
}
