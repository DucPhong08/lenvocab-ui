import { useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView, {
  type AnimationObject,
  type LottieViewProps,
} from 'lottie-react-native';
import { EffectsContext } from '@/hooks/effectsContext';
import { useForeground } from '@/hooks/useForeground';
import { useReduceMotion } from '@/hooks/useReduceMotion';

export function LottieAnimation({
  source,
  fallback,
  size = 128,
  loop = false,
  colorFilters,
}: {
  source: AnimationObject;
  fallback: ReactNode;
  size?: number;
  loop?: boolean;
  colorFilters?: LottieViewProps['colorFilters'];
}) {
  const animation = useRef<LottieView>(null);
  const started = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [finished, setFinished] = useState(false);
  const { animationsEnabled } = useContext(EffectsContext);
  const foreground = useForeground();
  const reduced = useReduceMotion();
  const visible = animationsEnabled && !reduced && !failed && !finished;

  useEffect(() => {
    if (!ready) return;
    const view = animation.current;
    if (!visible || !foreground) view?.pause();
    else if (started.current) view?.resume();
    else {
      started.current = true;
      view?.play();
    }
    return () => view?.pause();
  }, [ready, visible, foreground]);

  return (
    <View
      style={[styles.frame, { width: size, height: size }]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={visible && ready ? styles.hidden : undefined}>
        {fallback}
      </View>
      <LottieView
        ref={animation}
        source={source}
        colorFilters={colorFilters}
        autoPlay={false}
        loop={loop}
        style={[StyleSheet.absoluteFill, !(visible && ready) && styles.hidden]}
        onAnimationLoaded={() => setReady(true)}
        onAnimationFailure={() => setFailed(true)}
        onAnimationFinish={cancelled => {
          if (!loop && !cancelled) setFinished(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: { opacity: 0 },
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
