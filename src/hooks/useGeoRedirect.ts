import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { safeGetItem, safeSetItem } from '@/utils/storage';

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

export const useGeoRedirect = () => {
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const detectAndRedirect = async () => {
      try {
        // Check if user has manual preference
        const savedPreference = safeGetItem(COUNTRY_STORAGE_KEY);
        if (savedPreference) {
          setDetectedCountry(savedPreference);
          setIsLoading(false);
          return;
        }

        // Only auto-redirect from homepage or pricing page
        const redirectableRoutes = ['/', '/pricing'];
        
        // Check if we've already done geo detection this session
        const geoChecked = safeGetItem(GEO_CHECKED_KEY, 'session');
        if (geoChecked) {
          setDetectedCountry(geoChecked);
          // Still redirect if on a redirectable route and country has a specific page
          const targetRoute = countryRoutes[geoChecked];
          if (targetRoute && redirectableRoutes.includes(location.pathname)) {
            navigate(targetRoute, { replace: true });
          }
          setIsLoading(false);
          return;
        }

        if (!redirectableRoutes.includes(location.pathname)) {
          setIsLoading(false);
          return;
        }

        // Detect country via IP
        const response = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        
        if (!response.ok) throw new Error('Geo API failed');
        
        const data = await response.json();
        const countryCode = data.country_code;
        
        setDetectedCountry(countryCode);
        safeSetItem(GEO_CHECKED_KEY, countryCode, 'session');

        // Redirect if country has specific landing page
        const targetRoute = countryRoutes[countryCode];
        if (targetRoute && redirectableRoutes.includes(location.pathname)) {
          navigate(targetRoute, { replace: true });
        }
      } catch (error) {
        console.log('Geo detection failed, defaulting to US');
        setDetectedCountry('US');
        safeSetItem(GEO_CHECKED_KEY, 'US', 'session');
      } finally {
        setIsLoading(false);
      }
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
