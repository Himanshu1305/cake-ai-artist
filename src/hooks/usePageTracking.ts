import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGeoContext } from '@/contexts/GeoContext';

export const usePageTracking = (pagePath: string, fallbackCountryCode?: string) => {
  const { detectedCountry } = useGeoContext();
  
  // Use detected country if available, otherwise fall back to page default
  const countryCode = detectedCountry || fallbackCountryCode;

  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Get or create session ID
        let sessionId: string | null = null;
        try {
          sessionId = sessionStorage.getItem('page_tracking_session');
          if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem('page_tracking_session', sessionId);
          }
        } catch {
          sessionId = crypto.randomUUID();
        }

        // Get current user if authenticated
        const { data: { user } } = await supabase.auth.getUser();

        await supabase.from('page_visits').insert({
          page_path: pagePath,
          country_code: countryCode,
          user_id: user?.id || null,
          session_id: sessionId,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null,
        });
      } catch (error) {
        // Silently fail - tracking shouldn't break the page
        console.error('Page tracking error:', error);
      }
    };

    trackVisit();
  }, [pagePath, countryCode]);
};
