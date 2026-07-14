import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Per-user rate limit: max 20 searches per day
const RATE_LIMIT_PER_DAY = 20;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  vendorType: string; // e.g. "bakery", "caterer", "event decorator"
  location: string;  // e.g. "Mumbai, India" or "Austin, TX"
  partyId?: string;
}

interface PlaceResult {
  name: string;
  address: string;
  rating?: number;
  ratingCount?: number;
  phone?: string;
  website?: string;
  mapsUrl?: string;
  openNow?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "No authorization header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: "Invalid token" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Premium gate
  const { data: profile } = await adminClient
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();
  if (!profile?.is_premium) {
    return new Response(
      JSON.stringify({ error: "premium_required", message: "Local vendor search is a Premium feature." }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Rate limit: max 20 searches per user per day
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await adminClient
    .from("vendor_search_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", dayAgo);
  if ((count ?? 0) >= RATE_LIMIT_PER_DAY) {
    return new Response(
      JSON.stringify({ error: "Rate limit reached. You can run up to 20 vendor searches per day." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { vendorType, location, partyId }: SearchRequest = await req.json();
  if (!vendorType || !location) {
    return new Response(
      JSON.stringify({ error: "vendorType and location are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Google Places API key not configured" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const query = `${vendorType} near ${location}`;

  // Google Places API (New) — Places Text Search
  const placesResponse = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.currentOpeningHours",
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: 10,
      languageCode: "en",
    }),
  });

  if (!placesResponse.ok) {
    const errBody = await placesResponse.text();
    console.error("Google Places error:", errBody);
    return new Response(
      JSON.stringify({ error: "Failed to fetch from Google Places API" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const placesData = await placesResponse.json();
  const rawPlaces = placesData.places ?? [];

  const results: PlaceResult[] = rawPlaces.map((p: any) => ({
    name: p.displayName?.text ?? "Unknown",
    address: p.formattedAddress ?? "",
    rating: p.rating,
    ratingCount: p.userRatingCount,
    phone: p.nationalPhoneNumber,
    website: p.websiteUri,
    mapsUrl: p.googleMapsUri,
    openNow: p.currentOpeningHours?.openNow,
  }));

  // Log usage (non-blocking)
  adminClient.from("vendor_search_usage").insert({
    user_id: user.id,
    query,
    location,
    result_count: results.length,
  }).then();

  return new Response(
    JSON.stringify({ results, query }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
};

serve(handler);

