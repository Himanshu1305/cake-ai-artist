import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADULT_OCC = /(anniversary|wedding|engage|baby shower|housewarm|retire|farewell|reunion|graduation)/i;

type ThemeProfile = { motifs: string[]; palette: string };

// Theme keyword → (motif variants, palette). The first motif that matches a keyword wins.
const THEME_MAP: Array<{ rx: RegExp; profile: ThemeProfile }> = [
  { rx: /champagne|toast|gala|black ?tie/i, profile: {
    motifs: [
      "two slender champagne flutes with rising bubbles, satin ribbon, soft candlelight",
      "an open vintage champagne bottle laid on silk, scattered gold sequins",
      "overhead flat-lay of crystal coupes and a sprig of jasmine on dark marble",
    ],
    palette: "deep ink, brushed gold and ivory" } },
  { rx: /retro|90s|80s|disco|vintage|nostalg/i, profile: {
    motifs: [
      "muted neon geometric shapes, soft grain, cassette-tape silhouette in shadow",
      "a vinyl record at an angle with abstract memphis-style confetti shapes",
      "a soft-focus arcade-light bokeh wash with a single retro polaroid frame",
    ],
    palette: "dusty teal, magenta and warm cream — tasteful, not garish" } },
  { rx: /garden|floral|rose|bloom|botanic|peony/i, profile: {
    motifs: [
      "lush peonies and eucalyptus draped on a linen runner, morning daylight",
      "an overhead bouquet of garden roses and ferns on weathered stone",
      "wild dahlias in a clay vase beside an open journal, soft window light",
    ],
    palette: "sage, blush and ivory" } },
  { rx: /tea|high tea|afternoon|rose ?garden/i, profile: {
    motifs: [
      "vintage porcelain teacup, lace doily, a single dusty rose, soft daylight",
      "a tiered cake stand with macarons in soft focus, linen backdrop",
      "an antique silver teapot beside dried rosebuds on parchment",
    ],
    palette: "dusty rose, ivory and antique brass" } },
  { rx: /star|night|evening|midnight|celest|moon/i, profile: {
    motifs: [
      "a deep midnight sky with faint gold constellations and a single drifting candle",
      "a velvet cloth scattered with brass stars and a quartz crystal",
      "soft navy textured backdrop with a crescent of warm candle glow",
    ],
    palette: "midnight navy, antique gold and cool ivory" } },
  { rx: /tropical|beach|sunset|island|paradise/i, profile: {
    motifs: [
      "monstera and palm leaves casting soft shadows over a warm sunset wash",
      "a halved coconut and hibiscus on woven rattan, golden-hour light",
      "overhead flat-lay of citrus, banana leaves and terracotta pottery",
    ],
    palette: "terracotta, coral and warm cream" } },
  { rx: /rustic|barn|vineyard|country|farm|wood/i, profile: {
    motifs: [
      "weathered oak grain with a sprig of dried wheat and twine",
      "an enamel mug, dried lavender bunch and a slice of fig on aged wood",
      "amber bottle, cork and sprigs of rosemary on a linen sack",
    ],
    palette: "warm amber, oat and forest" } },
  { rx: /minimal|modern|scandi|architect/i, profile: {
    motifs: [
      "a single sculptural ceramic vessel casting a long soft shadow",
      "two smooth river stones balanced on raw plaster",
      "a folded linen napkin and one olive branch on stone",
    ],
    palette: "warm stone, bone and soft taupe" } },
  { rx: /candle|cosy|cozy|fireside|hygge/i, profile: {
    motifs: [
      "a cluster of unlit pillar candles on a slate tray with a knit throw",
      "a single tall taper candle beside dried orange slices",
      "a wooden bowl of pinecones and a softly glowing lantern",
    ],
    palette: "warm umber, cream and ember orange" } },
  { rx: /royal|regal|baroque|opulent|luxe/i, profile: {
    motifs: [
      "rich velvet drape with an antique gilded frame corner and a single rose",
      "ornate brass key on a damask cloth with a wax seal",
      "a brocade cushion holding a single pearl strand under soft side light",
    ],
    palette: "burgundy, deep emerald and antique gold" } },
];

function pickTheme(theme: string): ThemeProfile {
  const t = theme || "";
  for (const entry of THEME_MAP) if (entry.rx.test(t)) return entry.profile;
  // Generic fallback — varied so we don't always default to florals
  return {
    motifs: [
      "an abstract painterly wash with a single sprig of greenery",
      "soft draped fabric folds catching warm directional light",
      "an overhead arrangement of seasonal foliage on textured paper",
    ],
    palette: "warm neutrals with one quiet accent colour",
  };
}

const COMPOSITIONS = [
  "overhead flat-lay composition",
  "angled close-up with shallow depth of field",
  "wide soft-focus composition with airy negative space",
  "side-lit still life with long gentle shadows",
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function buildPrompt(theme: string, occasion: string, _title: string, childAge?: number | null) {
  const occ = (occasion || "").toLowerCase();
  const isAdult = ADULT_OCC.test(occ);
  const isBirthday = /birthday/i.test(occ);

  const negative = "No people, no faces, no children, no text, no letters, no words, no logos, no watermarks, no UI elements, no clipart, no emoji, no chibi, no cartoon mascots, no copyrighted characters.";

  const profile = pickTheme(theme);
  const motif = pick(profile.motifs);
  const composition = pick(COMPOSITIONS);
  const variationSeed = `${motif} :: ${composition}`;

  if (isAdult) {
    const occHint =
      /baby shower/i.test(occ) ? " Evoke a gentle baby-shower mood without nursery clichés." :
      /housewarm/i.test(occ) ? " Evoke a warm, welcoming new-home mood." :
      /retire|farewell/i.test(occ) ? " Evoke a reflective, celebratory farewell mood." :
      /graduation/i.test(occ) ? " Evoke an aspirational, accomplished mood." :
      /wedding|engage/i.test(occ) ? " Evoke a romantic, ceremonial mood." :
      /anniversary/i.test(occ) ? " Evoke an enduring, romantic mood." : "";
    return {
      prompt: `Sophisticated, grown-up invitation hero background. ${composition}: ${motif}.${occHint} Painterly photographic feel, palette: ${profile.palette}. Generous negative space at top and centre for overlaid title text. Tasteful, magazine-quality editorial styling. NOT cartoonish, NO champagne flutes unless explicitly described above. ${negative}`,
      style: "adult-elegant",
      variationSeed,
    };
  }

  if (isBirthday) {
    const age = Number(childAge) || 0;
    let ageBand = "";
    if (age >= 13) {
      ageBand = "teen aesthetic, modern minimalist styling, NO baby props, NO cute mascots";
    } else if (age >= 9) {
      ageBand = "tween-friendly bold graphic styling, slightly grown-up, NO babyish characters";
    } else if (age >= 4) {
      ageBand = "bright cheerful illustrated styling, friendly storybook feel";
    } else if (age >= 1) {
      ageBand = "soft pastel toddler styling, gentle watercolor feel";
    } else {
      ageBand = "cheerful illustrated party styling";
    }
    return {
      prompt: `Birthday invitation hero background. ${composition}: ${motif}, reinterpreted as ${ageBand}. Palette: ${profile.palette}. Generous empty space at top and centre for overlaid title text. ${negative}`,
      style: "birthday",
      variationSeed,
    };
  }

  return {
    prompt: `Tasteful celebration invitation hero background. ${composition}: ${motif}. Palette: ${profile.palette}. Painterly editorial feel, generous negative space at the top for overlaid title text. ${negative}`,
    style: "generic",
    variationSeed,
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

    const { prompt, style, variationSeed } = buildPrompt(effTheme, effOcc, effTitle, effAge);

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
