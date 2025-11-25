import { useCallback } from 'react';

/**
 * Custom hook for haptic feedback on mobile devices
 * Uses the Web Vibration API to provide tactile feedback
 * Gracefully degrades on devices/browsers that don't support vibration
 */
export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        // Silently fail if vibration is not supported or blocked
        console.debug('Vibration not supported or blocked:', error);
      }
    }
  }, []);

  return {
    // Light tap - for buttons, checkboxes, toggles
    light: useCallback(() => vibrate(10), [vibrate]),
    
    // Medium tap - for selection changes, dropdown opens
    medium: useCallback(() => vibrate(25), [vibrate]),
    
    // Success pattern - for successful actions
    success: useCallback(() => vibrate([10, 50, 10]), [vibrate]),
    
    // Error pattern - for errors or warnings
    error: useCallback(() => vibrate([50, 30, 50]), [vibrate]),
  };
};
