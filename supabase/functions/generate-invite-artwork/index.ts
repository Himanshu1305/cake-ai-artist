import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { IMAGE_MODEL_CHEAP } from "../_shared/ai-models.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADULT_OCC = /(anniversary|wedding|engage|baby shower|housewarm|retire|farewell|reunion|graduation)/i;

type ThemeProfile = { motifs: string[]; palette: string };

// Theme keyword → (motif variants, palette). The first motif that matches a keyword wins.
// Palettes are deliberately warm, inviting and celebratory — never cold, grey or washed-out.
const THEME_MAP: Array<{ rx: RegExp; profile: ThemeProfile }> = [
  { rx: /champagne|toast|gala|black ?tie/i, profile: {
    motifs: [
      "two slender champagne flutes with rising golden bubbles, satin ribbon and warm candlelight glow",
      "an open vintage champagne bottle on warm silk with scattered gold sequins catching the light",
      "overhead flat-lay of crystal coupes and jasmine on warm marble lit by soft golden bokeh",
    ],
    palette: "warm gold, champagne and blush ivory with candle-glow highlights" } },
  { rx: /retro|90s|80s|disco|vintage|nostalg/i, profile: {
    motifs: [
      "vivid neon geometric shapes with soft grain and warm party-light bokeh",
      "a vinyl record at an angle with playful confetti shapes and a glow of warm stage light",
      "warm arcade-light bokeh wash with a single retro polaroid frame and gold sparkle",
    ],
    palette: "hot coral, warm magenta and golden cream — vibrant and joyful, not garish" } },
  { rx: /garden|floral|rose|bloom|botanic|peony/i, profile: {
    motifs: [
      "lush peonies and warm greenery on a linen runner in golden-hour sunlight",
      "an overhead bouquet of peach roses and soft ferns on warm stone with sun flares",
      "wild dahlias in a clay vase beside warm candlelight, sunlit window glow",
    ],
    palette: "blush, peach and warm ivory with soft gold light" } },
  { rx: /tea|high tea|afternoon|rose ?garden/i, profile: {
    motifs: [
      "porcelain teacup, lace, a single peach rose under warm afternoon sun",
      "a tiered cake stand with macarons in soft golden light on linen",
      "an antique gold teapot beside fresh rosebuds and a warm candle glow",
    ],
    palette: "rose, peach and warm gold — soft but joyful" } },
  { rx: /star|night|evening|midnight|celest|moon/i, profile: {
    motifs: [
      "a deep midnight sky with bright gold constellations and a warm glowing candle",
      "velvet cloth scattered with brass stars, a quartz crystal and warm fairy-light bokeh",
      "rich navy backdrop with a crescent of warm candle glow and gold sparkle",
    ],
    palette: "midnight navy lit by warm candle-gold and brushed gold accents — never cold" } },
  { rx: /tropical|beach|sunset|island|paradise/i, profile: {
    motifs: [
      "monstera and palm leaves in vivid sunset light with warm golden flares",
      "a halved coconut and hibiscus on rattan in rich golden-hour light",
      "overhead flat-lay of citrus, banana leaves and terracotta in warm afternoon sun",
    ],
    palette: "sunset coral, terracotta and warm gold" } },
  { rx: /rustic|barn|vineyard|country|farm|wood/i, profile: {
    motifs: [
      "warm oak grain with dried wheat, twine and a glowing tea-light",
      "an enamel mug, dried lavender and figs on amber-lit aged wood",
      "amber bottle, cork and rosemary on linen with warm candle glow",
    ],
    palette: "amber, terracotta and candle-gold — warm and welcoming" } },
  { rx: /minimal|modern|scandi|architect/i, profile: {
    motifs: [
      "a single sculptural ceramic vessel with one warm gold accent and soft golden side light",
      "two smooth stones on warm plaster catching golden-hour glow",
      "a folded linen napkin and one olive branch on warm cream stone, sunlit",
    ],
    palette: "warm cream and champagne with a single warm gold accent" } },
  { rx: /candle|cosy|cozy|fireside|hygge/i, profile: {
    motifs: [
      "a cluster of glowing pillar candles on a warm wood tray with a knit throw",
      "a tall taper candle beside dried orange slices in warm amber light",
      "a wooden bowl of pinecones and a softly glowing lantern radiating warm light",
    ],
    palette: "warm umber, candle-gold and ember orange" } },
  { rx: /royal|regal|baroque|opulent|luxe/i, profile: {
    motifs: [
      "rich velvet drape with a gilded frame corner and a warm rose under candlelight",
      "ornate brass key on damask cloth with a wax seal in warm golden light",
      "a brocade cushion holding a pearl strand under warm side light",
    ],
    palette: "warm burgundy, ruby and antique gold" } },
];

function pickTheme(theme: string): ThemeProfile {
  const t = theme || "";
  for (const entry of THEME_MAP) if (entry.rx.test(t)) return entry.profile;
  // Generic fallback — varied so we don't always default to florals
  return {
    motifs: [
      "a warm painterly wash with sun flares and a sprig of fresh greenery",
      "soft draped fabric folds catching warm golden directional light and faint sparkle",
      "an overhead arrangement of seasonal foliage on warm cream paper with golden bokeh",
    ],
    palette: "warm celebratory tones — champagne, blush and soft gold accents",
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
      prompt: `Sophisticated, grown-up celebration invitation hero background. ${composition}: ${motif}.${occHint} Warm, inviting, celebratory editorial photography with golden-hour light, soft glowing bokeh and a clear sense of joyful occasion. Palette: ${profile.palette}. The image MUST feel warm, festive and welcoming — never cold, dull, washed-out, grey, desaturated or overly neutral. Generous negative space at top and centre for overlaid title text. Tasteful and elegant — NOT cartoonish, NO champagne flutes unless explicitly described above. ${negative}`,
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
      prompt: `Birthday celebration invitation hero background. ${composition}: ${motif}, reinterpreted as ${ageBand}. Warm, inviting, celebratory feel with soft glowing light and a sense of joyful occasion. Palette: ${profile.palette}. The image MUST feel warm and festive — never dull, grey or washed-out. Generous empty space at top and centre for overlaid title text. ${negative}`,
      style: "birthday",
      variationSeed,
    };
  }

  return {
    prompt: `Warm, inviting celebration invitation hero background. ${composition}: ${motif}. Palette: ${profile.palette}. Celebratory editorial photography with golden-hour light and a joyful occasion mood — never cold, dull or washed-out. Generous negative space at the top for overlaid title text. ${negative}`,
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
        model: IMAGE_MODEL_CHEAP,
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

    const metaJson = { theme: effTheme, occasion: effOcc, childAge: effAge, style, variationSeed, promptVersion: "v2-warm", generatedAt: new Date().toISOString() };
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
