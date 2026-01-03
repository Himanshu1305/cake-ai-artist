import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { safeGetItem, safeSetItem } from '@/utils/storage';
import { supabase } from '@/integrations/supabase/client';

const COUNTRY_STORAGE_KEY = 'user_country_preference';
const GEO_CHECKED_KEY = 'geo_detection_done';

type SupportedCountry = 'US' | 'UK' | 'CA' | 'AU' | 'IN';

const countryRoutes: Record<string, string> = {
  GB: '/uk',
  UK: '/uk',
  CA: '/canada',
  AU: '/australia',
  IN: '/india',
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
        // Still redirect if on a redirectable route and country has a specific page
        const targetRoute = countryRoutes[geoChecked];
        if (targetRoute && REDIRECTABLE_ROUTES.includes(location.pathname)) {
          debugLog('Redirecting to:', targetRoute);
          navigate(targetRoute, { replace: true });
        }
        setIsLoading(false);
        return;
      }

      // Only auto-redirect from redirectable routes
      if (!REDIRECTABLE_ROUTES.includes(location.pathname)) {
        debugLog('Not a redirectable route, skipping');
        setIsLoading(false);
        return;
      }

      // Detect country with fallback
      const countryCode = await detectCountry();

      if (countryCode) {
        debugLog('Detected country:', countryCode);
        setDetectedCountry(countryCode);
        safeSetItem(GEO_CHECKED_KEY, countryCode, 'session');

        // Redirect if country has specific landing page
        const targetRoute = countryRoutes[countryCode];
        if (targetRoute) {
          debugLog('Redirecting to:', targetRoute);
          navigate(targetRoute, { replace: true });
        }
      } else {
        debugLog('Geo detection failed, not caching. User stays on current page.');
        setDetectedCountry(null);
      }
      
      setIsLoading(false);
    };

    detectAndRedirect();
  }, [location.pathname, navigate]);

  const setCountryPreference = (country: SupportedCountry) => {
    safeSetItem(COUNTRY_STORAGE_KEY, country);
    setDetectedCountry(country);
    
    // Navigate to appropriate page
    if (country === 'US') {
      navigate('/');
    } else {
      const route = countryRoutes[country] || countryRoutes[country === 'UK' ? 'GB' : country];
      if (route) navigate(route);
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
