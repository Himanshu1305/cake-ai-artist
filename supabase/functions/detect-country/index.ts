import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// In-memory per-IP cache (1 hour). Per-instance only; fine for our scale.
const ipCache = new Map<string, { code: string; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

const getCached = (ip: string): string | null => {
  const hit = ipCache.get(ip);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    ipCache.delete(ip);
    return null;
  }
  return hit.code;
};

const setCached = (ip: string, code: string) => {
  ipCache.set(ip, { code, expiresAt: Date.now() + CACHE_TTL_MS });
  // Bound cache size.
  if (ipCache.size > 5000) {
    const firstKey = ipCache.keys().next().value;
    if (firstKey) ipCache.delete(firstKey);
  }
};

const fetchWithTimeout = async (url: string, ms = 1500): Promise<Response | null> => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    return r;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
};

// Provider 1: ipapi.co (1k/day free)
const tryIpapi = async (ip: string): Promise<string | null> => {
  const r = await fetchWithTimeout(`https://ipapi.co/${ip}/json/`);
  if (!r || !r.ok) return null;
  try {
    const j = await r.json();
    return j?.country_code || null;
  } catch {
    return null;
  }
};

// Provider 2: ip-api.com (45 req/min/IP, no key)
const tryIpApiCom = async (ip: string): Promise<string | null> => {
  const r = await fetchWithTimeout(`http://ip-api.com/json/${ip}?fields=countryCode`);
  if (!r || !r.ok) return null;
  try {
    const j = await r.json();
    return j?.countryCode || null;
  } catch {
    return null;
  }
};

// Provider 3: ipwho.is (free, no key)
const tryIpWhoIs = async (ip: string): Promise<string | null> => {
  const r = await fetchWithTimeout(`https://ipwho.is/${ip}?fields=country_code`);
  if (!r || !r.ok) return null;
  try {
    const j = await r.json();
    return j?.country_code || null;
  } catch {
    return null;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const respond = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    // Header-based detection (free, instant) — works on Cloudflare/Vercel/Fastly edges.
    const cf = req.headers.get('CF-IPCountry');
    if (cf && cf !== 'XX' && cf !== 'T1') {
      return respond({ country_code: cf, source: 'cloudflare', fallback: false });
    }
    const vc = req.headers.get('X-Vercel-IP-Country');
    if (vc) return respond({ country_code: vc, source: 'vercel', fallback: false });
    const xc = req.headers.get('X-Country-Code');
    if (xc) return respond({ country_code: xc, source: 'x-header', fallback: false });

    // Resolve client IP.
    const clientIP =
      req.headers.get('CF-Connecting-IP') ||
      req.headers.get('X-Real-IP') ||
      req.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
      '';

    if (!clientIP) {
      return respond({ country_code: null, source: 'none', fallback: true });
    }

    // Cache check.
    const cached = getCached(clientIP);
    if (cached) {
      return respond({ country_code: cached, source: 'cache', fallback: false });
    }

    // Provider chain — first success wins.
    const providers: Array<[string, () => Promise<string | null>]> = [
      ['ipapi.co', () => tryIpapi(clientIP)],
      ['ip-api.com', () => tryIpApiCom(clientIP)],
      ['ipwho.is', () => tryIpWhoIs(clientIP)],
    ];

    for (const [name, fn] of providers) {
      const code = await fn();
      if (code) {
        setCached(clientIP, code);
        return respond({ country_code: code, source: name, fallback: false });
      }
      console.log(`[detect-country] provider failed: ${name}`);
    }

    return respond({ country_code: null, source: 'none', fallback: true });
  } catch (error) {
    console.error('[detect-country] error:', error);
    return respond({ country_code: null, source: 'error', fallback: true, error: String(error) }, 200);
  }
});
