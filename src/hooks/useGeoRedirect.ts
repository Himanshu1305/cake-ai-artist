import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { safeGetItem, safeSetItem } from '@/utils/storage';
import { supabase } from '@/integrations/supabase/client';

const COUNTRY_STORAGE_KEY = 'user_country_preference';
const GEO_CHECKED_KEY = 'geo_detection_done';

type SupportedCountry = 'US' | 'UK' | 'CA' | 'AU' | 'IN';

// Asia (except India) → Australia page (AUD pricing)
const ASIA_COUNTRIES = ['JP', 'KR', 'CN', 'SG', 'MY', 'TH', 'VN', 'PH', 'ID', 'BD', 'PK', 'LK', 'NP', 'HK', 'TW', 'NZ'];

// Europe (except UK) → UK page (GBP pricing)
const EUROPE_COUNTRIES = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'PT', 'SE', 'NO', 'DK', 'FI', 'PL', 'AT', 'CH', 'IE', 'GR', 'CZ', 'HU', 'RO', 'UA', 'RU'];

// Middle East & Africa → UK page (GBP pricing)
const MENA_COUNTRIES = ['AE', 'SA', 'EG', 'ZA', 'NG', 'KE', 'IL', 'TR', 'DZ'];

// Get target route based on country code
const getTargetRoute = (countryCode: string): string | null => {
  // Direct country matches
  if (countryCode === 'IN') return '/india';
  if (countryCode === 'GB' || countryCode === 'UK') return '/uk';
  if (countryCode === 'CA') return '/canada';
  if (countryCode === 'AU') return '/australia';
  
  // Asia → Australia page (AUD pricing)
  if (ASIA_COUNTRIES.includes(countryCode)) return '/australia';
  
  // Europe → UK page (GBP pricing)
  if (EUROPE_COUNTRIES.includes(countryCode)) return '/uk';
  
  // Middle East & Africa → UK page (GBP pricing)
  if (MENA_COUNTRIES.includes(countryCode)) return '/uk';
  
  // Americas & rest of world → stay on / (USD)
  return null;
};

const REDIRECTABLE_ROUTES = ['/', '/pricing'];

// Helper to check for debug mode
const isDebugMode = () => {
  try {
    return new URLSearchParams(window.location.search).has('geoDebug');
  } catch {
    return false;
  }
};

const debugLog = (...args: unknown[]) => {
  if (isDebugMode()) {
    console.log('[GeoRedirect]', ...args);
  }
};

// Fetch with AbortController-based timeout
const fetchWithTimeout = async (url: string, timeoutMs: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Primary: Client-side geo detection via ipapi.co
const detectCountryClient = async (): Promise<string | null> => {
  try {
    const response = await fetchWithTimeout('https://ipapi.co/json/', 3000);
    if (!response.ok) throw new Error('ipapi.co failed');
    const data = await response.json();
    debugLog('ipapi.co response:', data.country_code);
    return data.country_code || null;
  } catch (error) {
    debugLog('ipapi.co failed:', error);
    return null;
  }
};

// Fallback: Server-side geo detection via Edge Function
const detectCountryServer = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('detect-country');
    if (error) throw error;
    debugLog('Edge function response:', data);
    return data?.country_code || null;
  } catch (error) {
    debugLog('Edge function failed:', error);
    return null;
  }
};

// Combined detection with fallback
const detectCountry = async (): Promise<string | null> => {
  // Try client-side first
  let country = await detectCountryClient();
  
  // Fallback to server-side if client fails
  if (!country) {
    debugLog('Trying server-side fallback...');
    country = await detectCountryServer();
  }
  
  return country;
};

export const useGeoRedirect = () => {
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const detectAndRedirect = async () => {
      debugLog('Starting geo detection for path:', location.pathname);
      
      // Early exit: Only process redirectable routes
      if (!REDIRECTABLE_ROUTES.includes(location.pathname)) {
        debugLog('Not a redirectable route, skipping');
        setIsLoading(false);
        return;
      }
      
      // Check if user has manual preference
      const savedPreference = safeGetItem(COUNTRY_STORAGE_KEY);
      if (savedPreference) {
        debugLog('Using saved preference:', savedPreference);
        setDetectedCountry(savedPreference);
        setIsLoading(false);
        return;
      }

      // Check if we've already done geo detection this session
      const geoChecked = safeGetItem(GEO_CHECKED_KEY, 'session');
      if (geoChecked) {
        debugLog('Using cached geo result:', geoChecked);
        setDetectedCountry(geoChecked);
        // Redirect if country has a specific page (defer to avoid render-time navigation)
        const targetRoute = getTargetRoute(geoChecked);
        if (targetRoute) {
          debugLog('Redirecting to:', targetRoute);
          setTimeout(() => navigate(targetRoute, { replace: true }), 0);
        }
        setIsLoading(false);
        return;
      }

      // Detect country with fallback
      const countryCode = await detectCountry();

      if (countryCode) {
        debugLog('Detected country:', countryCode);
        setDetectedCountry(countryCode);
        safeSetItem(GEO_CHECKED_KEY, countryCode, 'session');

        // Redirect if country has specific landing page (defer to avoid render-time navigation)
        const targetRoute = getTargetRoute(countryCode);
        if (targetRoute) {
          debugLog('Redirecting to:', targetRoute);
          setTimeout(() => navigate(targetRoute, { replace: true }), 0);
        }
      } else {
        debugLog('Geo detection failed, not caching. User stays on current page.');
        setDetectedCountry(null);
      }
      
      setIsLoading(false);
    };

    detectAndRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const setCountryPreference = (country: SupportedCountry) => {
    safeSetItem(COUNTRY_STORAGE_KEY, country);
    setDetectedCountry(country);
    
    // Navigate to appropriate page
    const route = getTargetRoute(country);
    if (route) {
      navigate(route);
    } else {
      navigate('/');
    }
  };

  const clearCountryPreference = () => {
    try {
      localStorage.removeItem(COUNTRY_STORAGE_KEY);
      sessionStorage.removeItem(GEO_CHECKED_KEY);
    } catch (e) {
      // Storage unavailable
    }
  };

  return {
    detectedCountry,
    isLoading,
    setCountryPreference,
    clearCountryPreference,
  };
};
