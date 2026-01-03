import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { safeGetItem, safeSetItem } from '@/utils/storage';

const GEO_CHECKED_KEY = 'geo_detection_done';

interface GeoContextType {
  detectedCountry: string | null;
  isLoading: boolean;
}

const GeoContext = createContext<GeoContextType>({ detectedCountry: null, isLoading: true });

// Fetch with AbortController-based timeout for broader compatibility
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

// Single geo detection attempt
const detectCountry = async (): Promise<string | null> => {
  try {
    const response = await fetchWithTimeout('https://ipapi.co/json/', 3000);
    if (!response.ok) throw new Error('Geo API failed');
    const data = await response.json();
    return data.country_code || null;
  } catch (error) {
    console.error('[GeoContext] Geo detection failed:', error);
    return null;
  }
};

export const GeoProvider = ({ children }: { children: ReactNode }) => {
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detect = async () => {
      // Check if we already have a cached result this session
      const cached = safeGetItem(GEO_CHECKED_KEY, 'session');
      if (cached) {
        setDetectedCountry(cached);
        setIsLoading(false);
        return;
      }

      // Try to detect country
      let country = await detectCountry();
      
      // Retry once if first attempt failed
      if (!country) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        country = await detectCountry();
      }

      if (country) {
        setDetectedCountry(country);
        safeSetItem(GEO_CHECKED_KEY, country, 'session');
      }
      
      setIsLoading(false);
    };

    detect();
  }, []);

  return (
    <GeoContext.Provider value={{ detectedCountry, isLoading }}>
      {children}
    </GeoContext.Provider>
  );
};

export const useGeoContext = () => useContext(GeoContext);
