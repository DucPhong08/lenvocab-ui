import { useEffect, useRef } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReduceMotion() {
  const reduceMotion = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      reduceMotion.current = value;
    });
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      value => {
        reduceMotion.current = value;
      },
    );
    return () => listener.remove();
  }, []);

  return reduceMotion;
}
