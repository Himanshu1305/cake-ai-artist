import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { safeGetItem, safeSetItem } from '@/utils/storage';
import { supabase } from '@/integrations/supabase/client';

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

// Primary: Client-side geo detection via ipapi.co
const detectCountryClient = async (): Promise<string | null> => {
  try {
    const response = await fetchWithTimeout('https://ipapi.co/json/', 3000);
    if (!response.ok) throw new Error('ipapi.co failed');
    const data = await response.json();
    console.log('[GeoContext] ipapi.co response:', data.country_code);
    return data.country_code || null;
  } catch (error) {
    console.log('[GeoContext] ipapi.co failed:', error);
    return null;
  }
};

// Fallback: Server-side geo detection via Edge Function
const detectCountryServer = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('detect-country');
    if (error) throw error;
    console.log('[GeoContext] Edge function response:', data);
    return data?.country_code || null;
  } catch (error) {
    console.log('[GeoContext] Edge function failed:', error);
    return null;
  }
};

// Combined detection with fallback
const detectCountry = async (): Promise<string | null> => {
  // Try client-side first (faster, no server cost)
  let country = await detectCountryClient();
  
  // Fallback to server-side if client fails
  if (!country) {
    console.log('[GeoContext] Trying server-side fallback...');
    country = await detectCountryServer();
  }
  
  return country;
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

      // Try to detect country (with fallback)
      const country = await detectCountry();

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
