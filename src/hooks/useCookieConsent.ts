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
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
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
      if (consent) {
        const parsed = JSON.parse(consent);
        setPreferences({
          necessary: true,
          analytics: parsed.analytics ?? false,
          marketing: parsed.marketing ?? false,
        });
      }
    } catch {
      // Invalid consent data - ignore
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
