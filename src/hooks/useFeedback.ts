import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useFeedback(duration = 2600) {
  const [feedback, setFeedback] = useState('');

  const showFeedback = useCallback((message: string) => {
    setFeedback(message);
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(''), duration);
    return () => clearTimeout(timer);
  }, [duration, feedback]);

  return { feedback, showFeedback };
}
