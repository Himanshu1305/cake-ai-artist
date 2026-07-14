import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Anonymous calls: max 5 per IP per hour
const ANON_RATE_LIMIT = 5;
const ANON_RATE_WINDOW_MS = 60 * 60 * 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, firstName, lastName, anonymous } = body as {
      email: string;
      firstName?: string;
      lastName?: string;
      anonymous?: boolean;
    };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");

    if (!anonymous && !authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // IP rate limiting for anonymous SharedCake flow
    if (anonymous) {
      const ip = getClientIP(req);
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const windowStart = new Date(Date.now() - ANON_RATE_WINDOW_MS).toISOString();
      const { data: existing } = await adminClient
        .from("brevo_anon_rate_limits")
        .select("id, request_count, window_start")
        .eq("ip", ip)
        .gte("window_start", windowStart)
        .single();

      if (existing) {
        if (existing.request_count >= ANON_RATE_LIMIT) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        await adminClient
          .from("brevo_anon_rate_limits")
          .update({ request_count: existing.request_count + 1 })
          .eq("id", existing.id);
      } else {
        await adminClient
          .from("brevo_anon_rate_limits")
          .insert({ ip, request_count: 1, window_start: new Date().toISOString() });
      }
    }

    console.log(`Adding contact to Brevo: ${email} (anonymous=${!!anonymous})`);

    const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY!,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: firstName || "",
          LASTNAME: lastName || "",
        },
        listIds: [3],
        updateEnabled: true,
      }),
    });

    const brevoData = await brevoResponse.json();

    if (!brevoResponse.ok) {
      if (brevoData.code === "duplicate_parameter") {
        return new Response(
          JSON.stringify({ success: true, message: "Contact already exists" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("Brevo API error:", brevoData);
      return new Response(
        JSON.stringify({ error: "Failed to add contact to Brevo", details: brevoData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully added ${email} to Brevo List #3`);
    return new Response(
      JSON.stringify({ success: true, brevoId: brevoData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in add-contact-to-brevo function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
