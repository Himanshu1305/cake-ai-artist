import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { safeGetItem, safeSetItem } from '@/utils/storage';
import { supabase } from '@/integrations/supabase/client';
import { isSearchBot, hasNoRedirectParam } from '@/utils/botDetection';
import {
  normalizeRegion,
  regionFromPathname,
  landingPathForRegion,
  getExplicitRegion,
} from '@/utils/countryRouting';

const GEO_CHECKED_KEY = 'geo_detection_done';


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

// Server-side multi-provider detection (primary)
const detectCountryServer = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('detect-country');
    if (error) return null;
    return data?.country_code || null;
  } catch {
    return null;
  }
};

// ipapi.co fallback (1.5s timeout)
const detectCountryClient = async (): Promise<string | null> => {
  try {
    const response = await fetchWithTimeout('https://ipapi.co/json/', 1500);
    if (!response.ok) return null;
    const data = await response.json();
    return data.country_code || null;
  } catch {
    return null;
  }
};

export const GeoRedirectWrapper = () => {
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });
        setIsAdmin(!!data);
      }
      setAdminChecked(true);
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    if (!adminChecked) return;
    if (isSearchBot()) return;
    if (hasNoRedirectParam()) return;
    if (isAdmin) return;
    if (hasRedirected) return;

    // We only correct mismatches on EXPLICIT country landing pages now.
    // `/` is rendered dynamically by Index.tsx — no redirect needed there.
    const currentRegion = regionFromPathname(location.pathname);
    if (currentRegion === null) return;

    const run = async () => {
      try {
        const explicit = getExplicitRegion();

        let iso = safeGetItem(GEO_CHECKED_KEY, 'session');
        if (!iso) {
          iso = (await detectCountryServer()) || (await detectCountryClient());
          if (iso) safeSetItem(GEO_CHECKED_KEY, iso, 'session');
        }

        const targetRegion = explicit || normalizeRegion(iso);
        if (!targetRegion) return;
        if (targetRegion === currentRegion) return;

        const targetPath = landingPathForRegion(targetRegion);
        if (targetPath === location.pathname) return;

        setHasRedirected(true);
        setTimeout(() => navigate(targetPath, { replace: true }), 0);
      } catch (error) {
        console.error('GeoRedirect error:', error);
      }
    };

    run();
  }, [location.pathname, hasRedirected, navigate, adminChecked, isAdmin]);

  return null;
};
