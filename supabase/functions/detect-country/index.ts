import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Try to get country from Cloudflare headers (most reliable)
    const cfCountry = req.headers.get('CF-IPCountry');
    if (cfCountry && cfCountry !== 'XX') {
      console.log(`[detect-country] CF-IPCountry: ${cfCountry}`);
      return new Response(
        JSON.stringify({ country_code: cfCountry, source: 'cloudflare' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try X-Country-Code header (some CDNs/proxies add this)
    const xCountry = req.headers.get('X-Country-Code');
    if (xCountry) {
      console.log(`[detect-country] X-Country-Code: ${xCountry}`);
      return new Response(
        JSON.stringify({ country_code: xCountry, source: 'x-header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client IP for logging
    const clientIP = req.headers.get('CF-Connecting-IP') || 
                     req.headers.get('X-Real-IP') || 
                     req.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
                     'unknown';
    
    console.log(`[detect-country] No country header found. Client IP: ${clientIP}`);
    
    // Return null if no country detected
    return new Response(
      JSON.stringify({ country_code: null, source: 'none', ip: clientIP }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[detect-country] Error:', error);
    return new Response(
      JSON.stringify({ country_code: null, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
