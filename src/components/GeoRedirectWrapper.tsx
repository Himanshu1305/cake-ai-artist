import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { safeGetItem, safeSetItem } from '@/utils/storage';
import { supabase } from '@/integrations/supabase/client';
import { isSearchBot } from '@/utils/botDetection';

const COUNTRY_STORAGE_KEY = 'user_country_preference';
const GEO_CHECKED_KEY = 'geo_detection_done';

const ASIA_COUNTRIES = ['JP', 'KR', 'CN', 'SG', 'MY', 'TH', 'VN', 'PH', 'ID', 'BD', 'PK', 'LK', 'NP', 'HK', 'TW', 'NZ'];
const EUROPE_COUNTRIES = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'PT', 'SE', 'NO', 'DK', 'FI', 'PL', 'AT', 'CH', 'IE', 'GR', 'CZ', 'HU', 'RO', 'UA', 'RU'];
const MENA_COUNTRIES = ['AE', 'SA', 'EG', 'ZA', 'NG', 'KE', 'IL', 'TR', 'DZ'];

const REDIRECTABLE_ROUTES = ['/', '/pricing'];

const getTargetRoute = (countryCode: string): string | null => {
  if (countryCode === 'IN') return '/india';
  if (countryCode === 'GB' || countryCode === 'UK') return '/uk';
  if (countryCode === 'CA') return '/canada';
  if (countryCode === 'AU') return '/australia';
  if (ASIA_COUNTRIES.includes(countryCode)) return '/australia';
  if (EUROPE_COUNTRIES.includes(countryCode)) return '/uk';
  if (MENA_COUNTRIES.includes(countryCode)) return '/uk';
  return null;
};

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

const detectCountryClient = async (): Promise<string | null> => {
  try {
    const response = await fetchWithTimeout('https://ipapi.co/json/', 3000);
    if (!response.ok) return null;
    const data = await response.json();
    return data.country_code || null;
  } catch {
    return null;
  }
};

const detectCountryServer = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('detect-country');
    if (error) return null;
    return data?.country_code || null;
  } catch {
    return null;
  }
};

export const GeoRedirectWrapper = () => {
  const [hasRedirected, setHasRedirected] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (hasRedirected || !REDIRECTABLE_ROUTES.includes(location.pathname)) {
      return;
    }

    const detectAndRedirect = async () => {
      try {
        // Skip redirect for search engine bots to allow proper indexing
        if (isSearchBot()) {
          console.log('[GeoRedirect] Search bot detected, skipping redirect');
          return;
        }
        
        const savedPreference = safeGetItem(COUNTRY_STORAGE_KEY);
        if (savedPreference) {
          setHasRedirected(true);
          return;
        }

        const geoChecked = safeGetItem(GEO_CHECKED_KEY, 'session');
        if (geoChecked) {
          const targetRoute = getTargetRoute(geoChecked);
          if (targetRoute) {
            setHasRedirected(true);
            setTimeout(() => navigate(targetRoute, { replace: true }), 0);
          }
          return;
        }

        let countryCode = await detectCountryClient();
        if (!countryCode) {
          countryCode = await detectCountryServer();
        }

        if (countryCode) {
          safeSetItem(GEO_CHECKED_KEY, countryCode, 'session');
          const targetRoute = getTargetRoute(countryCode);
          if (targetRoute) {
            setHasRedirected(true);
            setTimeout(() => navigate(targetRoute, { replace: true }), 0);
          }
        }
      } catch (error) {
        console.error('GeoRedirect error:', error);
      }
    };

    detectAndRedirect();
  }, [location.pathname, hasRedirected, navigate]);

  return null;
};
