import { useEffect } from 'react';

/**
 * iOS-safe scroll lock hook that prevents page jump when locking/unlocking scroll
 * Preserves scroll position by saving it before locking and restoring after unlocking
 */
export const useIOSScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) return;

    // Save current scroll position
    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;

    // Lock scroll and preserve position
    html.classList.add('scroll-locked');
    body.style.top = `-${scrollY}px`;

    // Cleanup: unlock scroll and restore position
    return () => {
      html.classList.remove('scroll-locked');
      body.style.top = '';
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
};
