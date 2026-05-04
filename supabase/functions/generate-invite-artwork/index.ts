import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADULT_OCC = /(anniversary|wedding|engage|baby shower|housewarm|retire|farewell|reunion|graduation)/i;

function buildPrompt(theme: string, occasion: string, title: string, childAge?: number | null) {
  const occ = (occasion || "").toLowerCase();
  const isAdult = ADULT_OCC.test(occ);
  const isBirthday = /birthday/i.test(occ);

  const negative = "No people, no faces, no children, no text, no letters, no words, no logos, no watermarks, no UI elements, no clipart, no emoji, no chibi, no cartoon mascots, no copyrighted characters.";

  if (isAdult) {
    let scene = "";
    if (/anniversary|wedding|engage/i.test(occ)) {
      scene = "soft warm bokeh, two delicate champagne flutes, fresh roses, gold ribbon, candlelight, romantic editorial still life, cinematic lighting";
    } else if (/baby shower/i.test(occ)) {
      scene = "muted pastel nursery still life, soft knit blanket, dried florals, tiny wooden details, gentle natural daylight";
    } else if (/housewarm/i.test(occ)) {
      scene = "warm cozy interior corner, fresh greenery in a ceramic vase, candle, linen, soft golden afternoon light";
    } else if (/retire|farewell/i.test(occ)) {
      scene = "elegant still life — leather notebook, fountain pen, a glass of amber whisky, soft warm desk lamp glow";
    } else if (/graduation/i.test(occ)) {
      scene = "tasteful still life, gold tassel, parchment, sprig of laurel, soft golden light";
    } else {
      scene = "elegant editorial still life, soft florals, candles, gold accents, warm cinematic lighting";
    }
    const themeHint = theme ? `, subtly inspired by the theme "${theme}" (re-interpret tastefully for adults — no childish motifs)` : "";
    return {
      prompt: `Sophisticated, grown-up invitation hero background. ${scene}${themeHint}. Painterly photographic feel, shallow depth of field, soft cream/blush/gold palette, lots of negative space at top and center for overlaid title text. Tasteful, magazine quality, NOT cartoonish. ${negative}`,
      style: "adult-elegant",
    };
  }

  if (isBirthday) {
    const age = Number(childAge) || 0;
    let ageBand = "";
    if (age >= 13) {
      ageBand = "teen aesthetic — moody pastel gradient with subtle confetti dust and a single piece of layered cake, modern minimalist, NO baby props, NO cute mascots";
    } else if (age >= 9) {
      ageBand = "tween-friendly bold graphic scene — clean illustrated balloons and streamers in punchy modern colors, slightly grown-up, NO babyish characters";
    } else if (age >= 4) {
      ageBand = "bright cheerful illustrated party scene with balloons, streamers and confetti in the theme palette, friendly storybook style";
    } else if (age >= 1) {
      ageBand = "soft pastel toddler party scene, gentle plush motifs, balloons in soft mint, peach and butter yellow, watercolor feel";
    } else {
      ageBand = "cheerful illustrated party scene with balloons, streamers and confetti in the theme palette";
    }
    const themeHint = theme ? `Theme: "${theme}".` : "";
    return {
      prompt: `Birthday invitation hero background. ${themeHint} ${ageBand}. Generous empty space at top and center for overlaid title text. ${negative}`,
      style: "birthday",
    };
  }

  // Generic / festive
  const themeHint = theme ? `, in the spirit of the theme "${theme}"` : "";
  return {
    prompt: `Tasteful celebration invitation hero background${themeHint}. Soft warm color palette, painterly editorial feel, generous negative space at the top for overlaid title text. ${negative}`,
    style: "generic",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.claims.sub;

    const { partyId, theme, occasion, title, childAge } = await req.json();
    if (!partyId) {
      return new Response(JSON.stringify({ error: "partyId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Verify ownership
    const { data: party, error: partyErr } = await supabase
      .from("parties")
      .select("id, user_id, theme, occasion, title, child_age")
      .eq("id", partyId)
      .maybeSingle();
    if (partyErr || !party || party.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const effTheme = theme || party.theme || "";
    const effOcc = occasion || party.occasion || "";
    const effTitle = title || party.title || "";
    const effAge = childAge ?? party.child_age ?? null;

    const { prompt, style } = buildPrompt(effTheme, effOcc, effTitle, effAge);

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await aiResp.json();
    const dataUrl: string | undefined = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!dataUrl?.startsWith("data:image/")) throw new Error("No image returned");

    const [meta, b64] = dataUrl.split(",");
    const mime = meta.match(/data:(image\/[a-zA-Z]+)/)?.[1] || "image/png";
    const ext = mime.split("/")[1] || "png";
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

    const path = `invites/${partyId}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("party-invites").upload(path, bytes, {
      contentType: mime,
      upsert: true,
    });
    if (upErr) {
      console.error("upload error", upErr);
      throw new Error("Storage upload failed");
    }
    const { data: pub } = supabase.storage.from("party-invites").getPublicUrl(path);
    const url = pub.publicUrl;

    const metaJson = { theme: effTheme, occasion: effOcc, childAge: effAge, style, generatedAt: new Date().toISOString() };
    await supabase
      .from("parties")
      .update({ invite_artwork_url: url, invite_artwork_meta: metaJson })
      .eq("id", partyId);

    return new Response(JSON.stringify({ url, meta: metaJson }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
