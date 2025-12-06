import { useState, useEffect, useCallback, useRef } from "react";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp?: string;
}

// Create a simple event system for cookie consent changes
const cookieConsentListeners: Set<() => void> = new Set();

export const triggerCookieConsentOpen = () => {
  cookieConsentListeners.forEach((listener) => listener());
};

export const useCookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    try {
      const consent = localStorage.getItem("cookieConsent");
      if (consent) {
        const parsed = JSON.parse(consent);
        return {
          necessary: true,
          analytics: parsed.analytics ?? false,
          marketing: parsed.marketing ?? false,
        };
      }
    } catch (e) {
      console.error("Error reading cookie consent from localStorage:", e);
    }
    return {
      necessary: true,
      analytics: false,
      marketing: false,
    };
  });

  const openConsentModal = useCallback(() => {
    setShowBanner(true);
  }, []);

  // Use ref to maintain stable callback reference
  const openConsentModalRef = useRef(openConsentModal);
  openConsentModalRef.current = openConsentModal;

  useEffect(() => {
    const listener = () => openConsentModalRef.current();
    cookieConsentListeners.add(listener);
    
    return () => {
      cookieConsentListeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookieConsent");
      if (!consent) {
        // No consent yet - show banner after delay
        const timer = setTimeout(() => setShowBanner(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error("Error checking cookie consent:", e);
      // Show banner anyway if localStorage fails
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    showBanner,
    setShowBanner,
    preferences,
    setPreferences,
    openConsentModal,
  };
};
