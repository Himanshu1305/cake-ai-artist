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

// Routes where a country mismatch should trigger a redirect for humans.
const REDIRECTABLE_ROUTES = ['/', '/usa', '/uk', '/india', '/canada', '/australia'];

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
    if (isAdmin) {
      console.log('[GeoRedirect] Admin user detected, skipping geo-redirect');
      return;
    }
    if (hasRedirected) return;

    // Only act on routes where region matters.
    const isRedirectable =
      REDIRECTABLE_ROUTES.includes(location.pathname) ||
      regionFromPathname(location.pathname) !== null;
    if (!isRedirectable) return;

    const run = async () => {
      try {
        // Explicit manual selection takes precedence — never override.
        const explicit = getExplicitRegion();

        // Get live geo (cached per session).
        let iso = safeGetItem(GEO_CHECKED_KEY, 'session');
        if (!iso) {
          iso = (await detectCountryClient()) || (await detectCountryServer());
          if (iso) safeSetItem(GEO_CHECKED_KEY, iso, 'session');
        }

        const targetRegion = explicit || normalizeRegion(iso);
        if (!targetRegion) return;

        const targetPath = landingPathForRegion(targetRegion);
        const currentRegion = regionFromPathname(location.pathname);

        // On `/`, redirect to localized landing if not US.
        // On any localized landing page, redirect to the correct one if mismatched.
        const shouldRedirect =
          (location.pathname === '/' && targetRegion !== 'US') ||
          (currentRegion !== null && currentRegion !== targetRegion);

        if (shouldRedirect && targetPath !== location.pathname) {
          setHasRedirected(true);
          setTimeout(() => navigate(targetPath, { replace: true }), 0);
        }
      } catch (error) {
        console.error('GeoRedirect error:', error);
      }
    };

    run();
  }, [location.pathname, hasRedirected, navigate, adminChecked, isAdmin]);

  return null;
};
