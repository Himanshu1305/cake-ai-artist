import { useState, useEffect, useCallback } from "react";

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

  useEffect(() => {
    // Register the listener
    cookieConsentListeners.add(openConsentModal);
    
    return () => {
      cookieConsentListeners.delete(openConsentModal);
    };
  }, [openConsentModal]);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (consent) {
      try {
        const parsed = JSON.parse(consent);
        setPreferences({
          necessary: true,
          analytics: parsed.analytics ?? false,
          marketing: parsed.marketing ?? false,
        });
      } catch {
        // Invalid consent data
      }
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
