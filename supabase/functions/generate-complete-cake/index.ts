import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Input validation schema
const cakeRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long").trim(),
  occasion: z.string().min(1, "Occasion is required").max(50),
  relation: z.string().min(1, "Relation is required").max(50),
  gender: z.string().min(1, "Gender is required").max(20),
  character: z.string().max(50).optional().nullable(),
  cakeStyle: z.enum(['decorated', 'sculpted']).optional().default('decorated'),
  cakeType: z.string().max(30).optional().nullable(),
  layers: z.string().max(20).optional().nullable(),
  theme: z.string().max(100).optional().nullable(),
  colors: z.string().max(100).optional().nullable(),
  userPhotoBase64: z.string().max(5000000).optional().nullable(), // ~3.75MB base64
  specificView: z.enum(['front', 'side', 'top', 'main']).optional().nullable(),
  quality: z.enum(['fast', 'high']).optional().default('fast'),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // Parse and validate input
    const rawInput = await req.json();
    const validationResult = cakeRequestSchema.safeParse(rawInput);

    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.errors.map(e => e.message).join(', ')
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      name, 
      character, 
      occasion, 
      relation, 
      gender, 
      cakeStyle,
      cakeType, 
      layers, 
      theme, 
      colors, 
      userPhotoBase64,
      specificView,
      quality
    } = validationResult.data;

    // Model selection based on quality setting.
    // Both modes use Nano Banana 2 (fast, pro-level quality) as the PRIMARY
    // model so users always get 3 images quickly. High quality differs by
    // using a richer prompt + a longer timeout + a slower premium fallback
    // (gemini-3-pro-image-preview) only when the primary fails.
    // For initial full generation we always use the fast pro-quality model.
    // High quality differs by: (a) richer prompt suffix, (b) only generating
    // the hero view initially so we don't blow the function timeout,
    // (c) reserving the slowest premium model strictly for manual single-view
    // regeneration (specificView) — never as automatic fallback in bulk.
    const imageModel = 'google/gemini-3.1-flash-image-preview';
    const FALLBACK_MODEL = (quality === 'high' && specificView)
      ? 'google/gemini-3-pro-image-preview'
      : 'google/gemini-2.5-flash-image';
    const PRIMARY_TIMEOUT_MS = quality === 'high' ? 55000 : 28000;
    const FALLBACK_TIMEOUT_MS = quality === 'high' ? 50000 : 15000;

    console.log('Generate complete cake request:', { name, character, occasion, relation, gender, cakeStyle, quality, imageModel });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get occasion-specific text for the cake
    const getOccasionText = (occ: string): string => {
      const texts: Record<string, string> = {
        'birthday': 'Happy Birthday',
        'anniversary': 'Happy Anniversary',
        'christmas': 'Merry Christmas',
        'new-year': 'Happy New Year',
        'wedding': 'Congratulations',
        'graduation': 'Congratulations',
        'baby-shower': 'Welcome Baby',
        'engagement': 'Congratulations',
        'promotion': 'Congratulations',
        'retirement': 'Happy Retirement',
        'farewell': 'Farewell',
        'celebration': 'Celebrate',
        'congratulations': 'Congratulations',
        'other': 'Best Wishes'
      };
      return texts[occ] || 'Celebrate';
    };

    const occasionText = getOccasionText(occasion || 'birthday');

    // Sculpted cake view angles (3 views - for character-shaped cakes)
    const sculptedViewAngles = [
      { 
        name: 'main', 
        description: `Professional food photography of an INCREDIBLE SCULPTED FONDANT CAKE masterpiece inspired by ${character || 'the character'}. 

CRITICAL - THIS MUST LOOK LIKE A REAL CAKE:
- The cake structure must be CLEARLY VISIBLE - showing fondant-covered cake layers, sculpted cake body, and sturdy base
- Show VISIBLE CAKE TEXTURES: smooth fondant surface with subtle sheen, fondant seams and edges, buttercream details, modeling chocolate accents
- Include handcrafted imperfections: slight asymmetries, visible tool marks, fondant wrinkles - NOT a perfect CGI render or plastic toy
- The character features should be STYLIZED and CAKE-LIKE (adorable, rounded, exaggerated for cake art) rather than hyper-realistic
- Show a sturdy cake board/drum at the base with decorative piped border

CAKE ART DETAILS TO INCLUDE:
- Visible fondant covering with subtle matte sheen
- Edible paint brush strokes for details
- Modeling chocolate or gum paste accents
- Piped royal icing or buttercream details
- Edible glitter or luster dust highlights on accents
- Structural cake board visible at base

This is a REAL bakery creation by a professional cake artist, photographed on a decorative cake stand in a bakery studio with warm, appetizing lighting. The viewer should immediately think "WOW, that's an amazing CAKE!" not "that looks like a figurine or toy." Full body/form visible from top to bottom.`,
        namePosition: 'on a decorative fondant banner/plaque integrated at the base',
        occasionPosition: 'on a fondant scroll or banner prominently displayed',
        photoPosition: null // No photo on main sculpted view
      },
      { 
        name: 'angle', 
        description: `Professional food photography of the SAME sculpted fondant cake from a 3/4 ANGLED perspective (camera roughly 30-40° to the side and slightly above). The full sculpted cake form must be visible from base to top with the cake board/drum included. Show the depth and dimensionality of the sculpt — visible fondant texture, side profile of details, and shading that emphasizes the handcrafted edible nature of the piece. Soft studio lighting from a slight side angle, magazine-style composition.`,
        namePosition: 'on a fondant banner or plaque on the visible side of the base, fully readable',
        occasionPosition: 'on a decorative side panel or fondant scroll, prominent and clear',
        photoPosition: null
      },
      { 
        name: 'top', 
        description: 'Professional overhead (bird\'s-eye / top-down) food photography of a SINGLE, COMPLETE luxurious cake. Camera is directly above the cake\'s center, slightly pulled back so the FULL circular silhouette of the cake is clearly visible with comfortable margin (approximately 15-25%) of negative space around it. The surrounding area can show the cake stand, table surface, and scattered decorative props (petals, sprinkles, small macarons, berries). The cake should occupy roughly 55-70% of the frame — DO NOT crop to its edge. Sharp focus on the top surface, soft natural studio lighting, magazine-style composition. The complete top decoration (text, photo, designs) must be fully visible and centered, never clipped.',
        namePosition: 'elegantly on the top surface or on a decorative banner — fully within the visible cake surface, never clipped at the rim',
        occasionPosition: 'prominently on the top surface in elegant fondant letters, fully visible and centered',
        photoPosition: 'centered on the top surface, occupying roughly 70% of the cake\'s top with a thin decorated border ring of frosting/fondant around it (NOT edge-to-edge)'
      }
    ];

    // Decorated cake view angles (3 views - traditional cake with character decorations)
    const decoratedViewAngles = [
      { 
        name: 'front', 
        description: 'Professional food photography of a SINGLE, COMPLETE luxurious cake from the FRONT VIEW, camera at eye level. The ENTIRE cake must be visible in frame - from the top decorations down to the cake stand/pedestal base. NO CROPPING. Full view of all cake tiers.',
        namePosition: 'on the bottom tier front face or cake board, centered horizontally',
        occasionPosition: 'prominently on the middle or top tier in large, elegant letters',
        photoPosition: 'on the middle tier center face' 
      },
      { 
        name: 'side', 
        description: 'Professional food photography of a SINGLE, COMPLETE luxurious cake from the SIDE VIEW, camera perpendicular. CRITICAL: The ENTIRE cake must be visible including ALL decorations on top (flowers, figurines, candles, etc.), all tiers, and the cake stand at bottom. Frame the shot to show the complete height from the highest decoration point to the base of the stand. NO CROPPING of top decorations or bottom stand. Zoom out slightly if needed to capture the full cake height.',
        namePosition: 'on the visible tier side panel',
        occasionPosition: 'on another tier or fondant plaque on the side',
        photoPosition: 'on the visible side of the top tier'
      },
      { 
        name: 'top', 
        description: 'Professional overhead (bird\'s-eye / top-down) food photography of a SINGLE, COMPLETE luxurious cake. Camera is directly above the cake\'s center, slightly pulled back so the FULL circular silhouette of the cake is clearly visible with comfortable margin (approximately 15-25%) of negative space around it. The surrounding area can show the cake stand, table surface, and scattered decorative props (petals, sprinkles, small macarons, berries). The cake should occupy roughly 55-70% of the frame — DO NOT crop to its edge. Sharp focus on the top surface, soft natural studio lighting, magazine-style composition. The complete top decoration (text, photo, designs) must be fully visible and centered, never clipped.',
        namePosition: 'elegantly on the top surface or on a decorative banner — fully within the visible cake surface, never clipped at the rim',
        occasionPosition: 'prominently on the top surface in elegant fondant letters, fully visible and centered',
        photoPosition: 'centered on the top surface, occupying roughly 70% of the cake\'s top with a thin decorated border ring of frosting/fondant around it (NOT edge-to-edge)'
      }
    ];

    // Always 3 (decorated) or 2 (sculpted) views — no hidden 4th image.
    const generateBothStyles = false;

    // Select view angles based on cake style
    const viewAngles = cakeStyle === 'sculpted' ? sculptedViewAngles : decoratedViewAngles;

    // Shared rules — appended to every prompt to avoid duplication.
    const qualityBoost = quality === 'high'
      ? `\n- ULTRA HIGH QUALITY: maximize fine detail — fondant micro-textures, crisp piping, accurate caustics, realistic crumb on any cut surface, photoreal soft shadows, color-graded like a magazine cover.`
      : '';
    const BASE_RULES = `
COMPOSITION RULES:
- Generate EXACTLY ONE CAKE — no collage, comparison, side-by-side, before/after, or multiple angles.
- Centered on a luxurious marble pedestal; complete cake visible top to bottom with adequate padding.
- Soft studio lighting, shallow depth of field, hyper-realistic, 8K, professional food photography, award-winning pastry art aesthetic, warm appetizing tones.
- Show each text element ONCE only — do NOT repeat any text.
- ABSOLUTELY NO PEOPLE, humans, faces, hands, body parts, silhouettes, or person-shaped figures anywhere in the frame or background. The scene must contain ONLY the cake, its stand, and tasteful bakery/studio props (flowers, utensils, fabric, plates). If a human would otherwise appear, replace that area with neutral bakery background.${qualityBoost}`;

    const SYSTEM_PROMPT = 'You are a professional food photographer. Generate a single high-quality photograph of ONE real edible cake. For sculpted cakes show visible fondant texture, cake structure, and handcrafted bakery details — never plastic, toy, or CGI looks. Never produce collages or multiple cakes in one image.';

    // Low-level call with abort timeout — returns base64 data URL or throws.
    const callImageModel = async (
      messages: any[],
      model: string,
      timeoutMs: number,
      label: string,
    ): Promise<string> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model, messages, modalities: ['image', 'text'] }),
          signal: controller.signal,
        });
        if (!resp.ok) {
          const errText = await resp.text().catch(() => '');
          console.error(`[${label}] gateway ${resp.status}:`, errText.slice(0, 300));
          if (resp.status === 429) throw new Error('RATE_LIMIT');
          if (resp.status === 402) throw new Error('CREDITS_EXHAUSTED');
          if (resp.status === 503) throw new Error('UPSTREAM_503');
          throw new Error(`Image generation failed: ${resp.status}`);
        }
        const data = await resp.json();
        const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (!url) throw new Error('No image returned');
        return url;
      } finally {
        clearTimeout(timer);
      }
    };

    // Build the per-view messages payload (text + optional photo).
    const buildMessages = (view: typeof viewAngles[0]): any[] => {
      // Top view with user photo — special photo overlay prompt.
      if (userPhotoBase64 && view.name === 'top') {
        const topPrompt = `${view.description}

The top surface features a large, circular edible photo print COVERING THE ENTIRE TOP from edge to edge using the provided reference image. The photo is the centerpiece, surrounded by ${theme || 'elegant'} decorative borders.

CRITICAL TEXT ON CAKE:
- Display "${occasionText}" or "HBD" prominently ${view.occasionPosition} in elegant fondant letters.
- Display the name "${name}" elegantly ${view.namePosition} in beautiful fondant script.
- Text in complementary color (gold, pink #D4687A, or blue #2563EB).
- EXACT SPELLING for name: ${name.split('').join('-')}.

Cake spec: ${layers || '2-tier'} ${cakeType || 'fondant'} cake, theme ${theme || 'elegant celebration'}, colors ${colors || 'soft pastels with white base'}.
${BASE_RULES}`;

        return [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: topPrompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${userPhotoBase64}` } },
            ],
          },
        ];
      }

      // Standard text-only prompt for all other views.
      let prompt = `${view.description}

CRITICAL TEXT ON CAKE:
- Display "${occasionText}" prominently ${view.occasionPosition} in elegant fondant/icing lettering.
- Display the name "${name}" ${view.namePosition} in beautiful script.
- Text large, readable, in complementary colors (gold, pink #D4687A, or blue #2563EB).
- EXACT SPELLING for name: ${name.split('').join('-')}.`;

      if (cakeStyle === 'sculpted' && view.name === 'main') {
        prompt += `

SCULPTED CAKE — must look like a REAL EDIBLE CAKE inspired by ${character || 'the character'}:
- Made of visible edible materials: fondant covering with subtle seams, modeling chocolate, buttercream details, cake layers inside.
- STYLIZED, rounded, cake-art look — NOT a hyper-real figurine, toy, or CGI render.
- Sitting on a cake board/drum with decorative piped border.
- Theme: ${theme || 'fun celebration'}; colors: ${colors || 'vibrant fondant tones'}.
- Do NOT show a tiered cake — this is a sculpted figure cake.`;
      } else if (cakeStyle === 'sculpted' && view.name === 'top') {
        prompt += `\n\nCake spec: round ${cakeType || 'fondant'} cake, theme ${theme || 'elegant celebration'} with ${character || ''} themed decorations, colors ${colors || 'soft pastels with white base'}.`;
      } else {
        prompt += `\n\nCake spec: ${layers || '2-tier'} ${cakeType || 'fondant'} cake, theme ${theme || 'elegant celebration'}, colors ${colors || 'soft pastels with white base'}.`;
        if (character) prompt += `\nCharacter: ${character} themed decorations and figurines placed tastefully.`;
      }

      prompt += `\n${BASE_RULES}`;

      return [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ];
    };

    // Generate one view: primary model + timeout, fallback model on timeout/503.
    // 429/402 still bubble up as RATE_LIMIT / CREDITS_EXHAUSTED.
    const generateView = async (view: typeof viewAngles[0]): Promise<string> => {
      const messages = buildMessages(view);
      const t0 = Date.now();
      try {
        const url = await callImageModel(messages, imageModel, PRIMARY_TIMEOUT_MS, view.name);
        console.log(`⏱ ${view.name} ok in ${Date.now() - t0}ms (model=${imageModel})`);
        return url;
      } catch (err: any) {
        const msg = err?.message || String(err);
        if (msg === 'RATE_LIMIT' || msg === 'CREDITS_EXHAUSTED') throw err;
        const isTimeout = err?.name === 'AbortError' || msg.includes('aborted');
        const is503 = msg === 'UPSTREAM_503';
        if (!isTimeout && !is503) {
          console.log(`⏱ ${view.name} fail in ${Date.now() - t0}ms — ${msg}`);
          throw err;
        }
        console.log(`⏱ ${view.name} primary ${isTimeout ? 'timeout' : '503'} after ${Date.now() - t0}ms — falling back to ${FALLBACK_MODEL}`);
        const tFb = Date.now();
        try {
          const url = await callImageModel(messages, FALLBACK_MODEL, FALLBACK_TIMEOUT_MS, `${view.name}/fallback`);
          console.log(`⏱ ${view.name} ok via fallback in ${Date.now() - tFb}ms`);
          return url;
        } catch (err2: any) {
          const msg2 = err2?.message || String(err2);
          if (msg2 === 'RATE_LIMIT' || msg2 === 'CREDITS_EXHAUSTED') throw err2;
          console.log(`⏱ ${view.name} fallback fail in ${Date.now() - tFb}ms — ${msg2}`);
          throw err2;
        }
      }
    };

    // Helper functions for message generation
    const getInverseRelation = (rel: string): string => {
      const inverses: Record<string, string> = {
        'daughter': 'parent', 'son': 'parent',
        'mother': 'child', 'father': 'child',
        'sister': 'sibling', 'brother': 'sibling',
        'wife': 'husband', 'husband': 'wife',
        'friend': 'friend', 'colleague': 'colleague',
        'partner': 'partner', 'in-laws': 'family member',
        'other': 'loved one'
      };
      return inverses[rel] || 'loved one';
    };

    const getRelationshipGuidance = (rel: string, gen: string): string => {
      if (rel === 'daughter') {
        return `GUIDANCE: Write as a loving parent to their daughter. Express pride, unconditional love, and hopes for her future. Use warm, affectionate language like "my beautiful daughter", "my princess" (if age-appropriate), or "watching you grow". Focus on parental pride and love.`;
      }
      if (rel === 'son') {
        return `GUIDANCE: Write as a proud parent to their son. Express how proud you are of him, your belief in him, and your unwavering support. Use terms like "my son", "my boy", "watching you become the man you are". Focus on parental pride and encouragement.`;
      }
      if (rel === 'mother') {
        return `GUIDANCE: Write as a ${gen === 'male' ? 'son' : gen === 'female' ? 'daughter' : 'child'} to their mother. Express gratitude, love, and appreciation for everything she does. Use terms like "Mom", "the best mom", "everything you do for me/us". Focus on appreciation and love.`;
      }
      if (rel === 'father') {
        return `GUIDANCE: Write as a ${gen === 'male' ? 'son' : gen === 'female' ? 'daughter' : 'child'} to their father. Express gratitude, admiration, and appreciation. Use terms like "Dad", "my hero", "everything you've taught me". Focus on respect and appreciation.`;
      }
      if (rel === 'sister') {
        return `GUIDANCE: Write as a sibling to their sister. Express the special bond between siblings, shared memories, and sisterly love. Use affectionate terms like "${gen === 'female' ? 'sis' : 'my sister'}", "best friend", "partner in crime". Keep it warm and playful.`;
      }
      if (rel === 'brother') {
        return `GUIDANCE: Write as a sibling to their brother. Express the brotherly bond, camaraderie, and love. Use terms like "${gen === 'male' ? 'bro' : 'my brother'}", "best buddy", "my protector". Keep it affectionate yet casual.`;
      }
      if (rel === 'wife') {
        return `GUIDANCE: Write as a husband to his wife. Express deep romantic love, partnership, and gratitude. Use terms like "my love", "my beautiful wife", "my partner in life". Focus on romance and commitment.`;
      }
      if (rel === 'husband') {
        return `GUIDANCE: Write as a wife to her husband. Express deep romantic love, partnership, and appreciation. Use terms like "my love", "my amazing husband", "my rock". Focus on romance and partnership.`;
      }
      if (rel === 'friend') {
        return `GUIDANCE: Write as a friend. Express appreciation for their friendship, shared memories, and support. Use casual yet heartfelt language. Focus on friendship bonds and good times together.`;
      }
      return `GUIDANCE: Write with warmth and genuine affection appropriate for a ${rel} relationship.`;
    };

    const getExampleMessages = (rel: string, occ: string, gen: string): string => {
      if (rel === 'daughter' && occ === 'birthday') {
        return `- "My dearest ${name}, watching you blossom into such an incredible young woman fills my heart with so much pride! Happy Birthday, my beautiful daughter – may this year bring you endless joy and all the dreams your heart desires!"
- "To my princess ${name}, another year of watching you grow and shine! Happy Birthday, sweetheart – you are and always will be my greatest blessing."`;
      }
      if (rel === 'son' && occ === 'birthday') {
        return `- "Happy Birthday, ${name}! Watching you grow into such an amazing ${gen === 'male' ? 'young man' : 'person'} has been my greatest joy. I'm so proud of everything you've become, my son. Here's to another incredible year!"
- "To my wonderful son ${name}, Happy Birthday! You make me proud every single day. May this year bring you success, happiness, and all the adventures you dream of!"`;
      }
      if (rel === 'mother' && occ === 'birthday') {
        return `- "Happy Birthday, Mom! Everything I am is because of you. Thank you for your endless love, wisdom, and support. You're not just the best mom – you're my hero. Love you more than words can say!"
- "To the most amazing mother, ${name}, Happy Birthday! Your love has shaped my life in countless beautiful ways. Thank you for everything you do. Here's to celebrating YOU today!"`;
      }
      if (rel === 'friend' && occ === 'birthday') {
        return `- "Happy Birthday, ${name}! Hope this year is everything you've been hyped about — count me in for the celebrations."
- "Another year of putting up with me — happy birthday, ${name}! Genuinely lucky to call you a friend."`;
      }
      if (rel === 'friend' && (occ === 'congratulations' || occ === 'graduation' || occ === 'promotion')) {
        return `- "Congrats, ${name}! Honestly not surprised — you've been working for this and it shows. So proud of you."
- "You did it, ${name}! Drinks are on you now, obviously. Beyond happy for you."`;
      }
      if (rel === 'colleague' && (occ === 'congratulations' || occ === 'promotion' || occ === 'graduation')) {
        return `- "Congratulations, ${name} — really well deserved. It's been great working alongside you."
- "Huge congrats, ${name}! You've put in the work and it shows. Cheering you on."`;
      }
      if (rel === 'colleague' && occ === 'birthday') {
        return `- "Happy Birthday, ${name}! Hope you get a proper break from the inbox today."
- "Wishing you a great birthday, ${name} — thanks for making the team a better place to be."`;
      }
      // Christmas messages
      if (occ === 'christmas') {
        return `- "Merry Christmas, ${name}! May your holidays be filled with warmth, joy, and wonderful memories. Wishing you a season of love and happiness!"
- "Merry Christmas to my dear ${rel}! May this festive season bring you peace, happiness, and all the blessings your heart can hold. Love you always!"`;
      }
      // New Year messages
      if (occ === 'new-year') {
        return `- "Happy New Year, ${name}! Here's to new beginnings, exciting adventures, and a year filled with happiness and success. Cheers to 2025!"
- "Wishing you a wonderful New Year, ${name}! May this year bring you everything you've been dreaming of. Let's make it an amazing one together!"`;
      }
      return '';
    };

    // Get occasion-specific message guidance
    const getOccasionGuidance = (occ: string): string => {
      if (occ === 'christmas') {
        return `CHRISTMAS MESSAGE GUIDELINES:
- Use "Merry Christmas" greeting (NOT "Happy Birthday" or other greetings)
- Include warm holiday wishes, festive spirit, and seasonal joy
- Reference holiday themes: warmth, family togetherness, blessings, peace, joy
- Make it feel cozy, loving, and celebratory of the Christmas season`;
      }
      if (occ === 'new-year') {
        return `NEW YEAR MESSAGE GUIDELINES:
- Use "Happy New Year" greeting (NOT "Happy Birthday" or other greetings)
- Include wishes for the year ahead: new beginnings, success, happiness
- Reference new year themes: fresh starts, hopes, dreams, exciting adventures
- Make it feel optimistic, forward-looking, and celebratory of new opportunities`;
      }
      return '';
    };

    // Tone profile by relationship — drives how casual/warm/formal the message sounds.
    const getToneProfile = (rel: string): string => {
      switch (rel) {
        case 'friend':
          return `TONE: Casual, warm, like a real text message between close friends. Use contractions ("you're", "can't", "we've"). Sound a little playful, a little proud of them. Reference the vibe of friendship, not just the occasion. Avoid greeting-card phrases. It should feel like something you'd actually send on WhatsApp, not write in a corporate card.`;
        case 'colleague':
          return `TONE: Warm, sincere, professionally respectful. Friendly but NOT intimate — no "love you", no pet names, no overly emotional lines. Acknowledge them as a person, not just a coworker. Avoid corporate filler like "wishing you continued success in your endeavors". Sound like a real human teammate who genuinely respects them.`;
        case 'partner':
          return `TONE: Romantic, intimate, emotionally present. Sound like you wrote it for them alone — specific, tender, a little vulnerable. Avoid clichés.`;
        case 'husband':
        case 'wife':
          return `TONE: Deeply romantic and personal. Speak from the heart, like a private note between spouses. Avoid generic love-poem clichés.`;
        case 'mother':
        case 'father':
          return `TONE: Grateful, respectful, warm. Sound like an adult child writing honestly, not performatively. Avoid greeting-card filler.`;
        case 'daughter':
        case 'son':
          return `TONE: Loving, proud, tender — a parent speaking to their child. Sound like a real parent, not a Hallmark card.`;
        case 'sister':
        case 'brother':
          return `TONE: Affectionate sibling energy — warm, a little teasing, a lot of love. Sound real, not formal.`;
        case 'in-laws':
          return `TONE: Warm and respectful, family-friendly. Not as intimate as nuclear family. Sincere appreciation.`;
        default:
          return `TONE: Warm, sincere, human. Match the relationship without sounding scripted.`;
      }
    };

    // Message generation function
    const generateMessageAsync = async (): Promise<string> => {
      const inverseRel = getInverseRelation(relation);
      const occasionGuidance = getOccasionGuidance(occasion || 'birthday');
      const toneProfile = getToneProfile(relation);
      const messagePrompt = `You are writing a short ${occasion || 'birthday'} message FROM a ${inverseRel} TO their ${relation} named ${name}.

CONTEXT:
- Recipient: ${name} (${gender || 'unspecified'})
- Relationship to sender: ${relation} (sender is the ${inverseRel})
- Occasion: ${occasion || 'birthday'}

${toneProfile}

${occasionGuidance}

${getRelationshipGuidance(relation, gender)}

HARD RULES — DO NOT BREAK:
1. Exactly 2 short sentences. Total under 200 characters if possible.
2. It MUST sound like a real human wrote it — not AI, not a greeting card.
3. BAN these phrases (and anything similar): "on this special occasion", "may your day be filled with", "wishing you continued success", "heartfelt congratulations", "warmest wishes", "may all your dreams come true", "endless joy and prosperity".
4. Use contractions naturally where the tone allows.
5. Use the CORRECT greeting for the occasion (Merry Christmas, Happy New Year, Happy Birthday, Congratulations, etc.).
6. Do NOT mention the cake, the character theme, or any visual element. Only the message.
7. Return ONLY the message text. No quotes, no preface, no signature.

${getExampleMessages(relation, occasion || 'birthday', gender) ? `EXAMPLES of the right tone (do not copy verbatim):\n${getExampleMessages(relation, occasion || 'birthday', gender)}` : ''}`;

      const messageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: messagePrompt }],
        }),
      });

      if (!messageResponse.ok) {
        console.error('Message generation failed:', messageResponse.status);
        throw new Error('Failed to generate greeting message');
      }

      const messageData = await messageResponse.json();
      return messageData.choices?.[0]?.message?.content?.trim() || 
        `Happy ${occasion || 'Birthday'}, ${name}! Wishing you a day filled with joy and celebration!`;
    };

    // Generate images - either specific view or all views
    let generatedImages: (string | null)[] = [];
    let greetingMessage = '';
    let imageLabels: string[] = [];
    let failedViews: string[] = [];

    try {
      if (specificView) {
        // Regenerate only the specified view
        console.log(`Regenerating only ${specificView} view...`);

        let viewAnglesToUse = viewAngles;
        let viewStyle: 'decorated' | 'sculpted' = cakeStyle;

        if (specificView === 'main') {
          viewAnglesToUse = sculptedViewAngles;
          viewStyle = 'sculpted';
        } else if (['front', 'side'].includes(specificView)) {
          viewAnglesToUse = decoratedViewAngles;
          viewStyle = 'decorated';
        }

        const viewIndex = viewAnglesToUse.findIndex(v => v.name === specificView);
        if (viewIndex === -1) throw new Error(`Invalid view name: ${specificView}`);
        const regeneratedImage = await generateView(viewAnglesToUse[viewIndex]);

        return new Response(
          JSON.stringify({ regeneratedImage, viewIndex, viewName: specificView, viewStyle }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Pick view list + labels.
      // High Quality intentionally only renders the HERO view first so the
      // function reliably finishes within timeout. The user can then use
      // "Regenerate" on the placeholder slots to fill the remaining views
      // one-by-one (those single-view calls have a much larger time budget).
      let viewsToRun: typeof viewAngles;
      if (cakeStyle === 'sculpted') {
        if (quality === 'high') {
          // High quality: all 3 views (main + angle + top), parallel kick-off below
          viewsToRun = [viewAngles[0], viewAngles[1], viewAngles[2]];
          imageLabels = ['Main View', 'Angle View', 'Top-Down View'];
        } else {
          // Standard quality: 2 views only (cost saving)
          viewsToRun = [viewAngles[0], viewAngles[2]]; // main + top
          imageLabels = ['Main View', 'Top-Down View'];
        }
      } else {
        if (quality === 'high') {
          viewsToRun = [viewAngles[0], viewAngles[1], viewAngles[2]]; // all 3, parallel kick-off below
          imageLabels = ['Front View', 'Side View', 'Top-Down View'];
        } else {
          viewsToRun = [viewAngles[0], viewAngles[1], viewAngles[2]];
          imageLabels = ['Front View', 'Side View', 'Top-Down View'];
        }
      }

      const wallStart = Date.now();

      // ============================================================
      // HIGH QUALITY: stream views back progressively.
      //   1. Generate hero view inline (~30s).
      //   2. Generate the greeting message inline (cheap).
      //   3. Insert a job row with the hero image + message.
      //   4. EdgeRuntime.waitUntil(...) finishes the remaining views in
      //      the background and updates the job row column-by-column.
      //      Client subscribes via Supabase Realtime to pick them up.
      // ============================================================
      if (quality === 'high') {
        // viewsToRun is already set to all 3 views above (hero + 2 background).
        const heroView = viewsToRun[0];
        const allViewNames = viewsToRun.map(v => v.name);
        const tStart = Date.now();

        // CRITICAL: fire ALL image promises at the same instant. They run truly
        // in parallel inside the Lovable AI Gateway. We only AWAIT the hero
        // here so we can return it ASAP; the others continue in the background.
        const viewPromises = viewsToRun.map(v => generateView(v));
        const messagePromise = generateMessageAsync();

        // Await hero + message before responding (~15-20s).
        const [heroSettled, messageSettled] = await Promise.allSettled([
          viewPromises[0],
          messagePromise,
        ]);

        if (heroSettled.status === 'rejected') {
          const m = heroSettled.reason?.message || String(heroSettled.reason);
          if (m === 'RATE_LIMIT') throw new Error('RATE_LIMIT');
          if (m === 'CREDITS_EXHAUSTED') throw new Error('CREDITS_EXHAUSTED');
          throw new Error('Hero view generation failed. Please try again.');
        }
        const heroUrl = heroSettled.value as string;

        greetingMessage = messageSettled.status === 'fulfilled'
          ? (messageSettled.value as string)
          : `Happy ${occasion || 'Birthday'}, ${name}! Wishing you a day filled with joy and celebration!`;

        console.log(`⏱ HQ hero ready in ${Date.now() - tStart}ms — responding now, ${viewPromises.length - 1} views still streaming`);

        // Insert job row with hero already filled.
        const jobInsert: Record<string, unknown> = {
          user_id: user.id,
          status: 'in_progress',
          cake_style: cakeStyle,
          hero_view: heroView.name,
          hero_url: heroUrl,
          greeting_message: greetingMessage,
          view_count: allViewNames.length,
        };
        const { data: jobRow, error: jobErr } = await supabase
          .from('cake_generation_jobs')
          .insert(jobInsert)
          .select('id')
          .single();
        if (jobErr || !jobRow) {
          console.error('Failed to create job row:', jobErr);
          throw new Error('Failed to track generation job');
        }
        const jobId = jobRow.id;

        // Build response images aligned with viewsToRun; hero filled, others null.
        const responseImages: (string | null)[] = viewsToRun.map((v, i) =>
          i === 0 ? heroUrl : null
        );
        const responseFailed: string[] = viewsToRun.slice(1).map(v => v.name);

        // Index-based slot mapping.
        const slotForIndex = (i: number): { url: string; err: string } => (
          i === 1 ? { url: 'side_url', err: 'side_error' } :
          i === 2 ? { url: 'top_url', err: 'top_error' } :
          { url: 'side_url', err: 'side_error' }
        );

        // Background task: AWAIT the already-running promises and write each
        // result into its slot the moment it lands.
        const bgTask = (async () => {
          const tBg = Date.now();
          console.log(`[bg ${jobId}] awaiting ${viewPromises.length - 1} background views (already running in parallel)`);
          await Promise.all(viewPromises.slice(1).map(async (p, j) => {
            const i = j + 1;
            const v = viewsToRun[i];
            const slot = slotForIndex(i);
            const tv = Date.now();
            try {
              const url = await p;
              await supabase.from('cake_generation_jobs')
                .update({ [slot.url]: url })
                .eq('id', jobId);
              console.log(`[bg ${jobId}] ${v.name} stored in ${slot.url} (wait ${Date.now() - tv}ms)`);
            } catch (e: any) {
              const errMsg = (e?.message || String(e)).slice(0, 200);
              console.error(`[bg ${jobId}] ${v.name} failed:`, errMsg);
              await supabase.from('cake_generation_jobs')
                .update({ [slot.err]: errMsg })
                .eq('id', jobId);
            }
          }));
          // Honest final status — never silently mark "completed" when slots are missing.
          const { data: finalRow } = await supabase
            .from('cake_generation_jobs')
            .select('hero_url, side_url, top_url, hero_error, side_error, top_error, view_count')
            .eq('id', jobId)
            .single();
          const expected = finalRow?.view_count ?? allViewNames.length;
          const filled = [finalRow?.hero_url, finalRow?.side_url, finalRow?.top_url].filter(Boolean).length;
          const status = filled >= expected ? 'completed' : 'partial_failed';
          await supabase.from('cake_generation_jobs')
            .update({ status, completed_at: new Date().toISOString() })
            .eq('id', jobId);
          console.log(`[bg ${jobId}] background done in ${Date.now() - tBg}ms — status=${status}, filled=${filled}/${expected}`);
        })();

        // @ts-ignore — EdgeRuntime is provided by Supabase Edge Functions runtime.
        if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime?.waitUntil) {
          // @ts-ignore
          EdgeRuntime.waitUntil(bgTask);
        } else {
          bgTask.catch(() => {});
        }

        return new Response(
          JSON.stringify({
            success: true,
            images: responseImages,
            imageLabels,
            generateBothStyles,
            failedViews: responseFailed,
            greetingMessage,
            jobId,
            viewOrder: allViewNames,
            heroView: heroView.name,
            backgroundViews: viewsToRun.slice(1).map(v => v.name),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================================
      // STANDARD QUALITY: generate all views in parallel inline (unchanged).
      // ============================================================
      console.log(`Starting parallel generation of ${viewsToRun.length} views + message...`);

      // allSettled for soft-failure on images; message is best-effort.
      const [imageSettled, messageSettled] = await Promise.all([
        Promise.allSettled(viewsToRun.map(v => generateView(v))),
        Promise.allSettled([generateMessageAsync()]),
      ]);

      // Check for hard fails (rate-limit / credits) — bubble immediately.
      for (const r of imageSettled) {
        if (r.status === 'rejected') {
          const m = r.reason?.message || String(r.reason);
          if (m === 'RATE_LIMIT') throw new Error('RATE_LIMIT');
          if (m === 'CREDITS_EXHAUSTED') throw new Error('CREDITS_EXHAUSTED');
        }
      }

      generatedImages = imageSettled.map((r, i) => {
        if (r.status === 'fulfilled') return r.value;
        failedViews.push(viewsToRun[i].name);
        console.error(`View ${viewsToRun[i].name} failed:`, r.reason?.message || r.reason);
        return null;
      });

      const okCount = generatedImages.filter(Boolean).length;
      console.log(`⏱ TOTAL ${Date.now() - wallStart}ms — ${okCount}/${viewsToRun.length} views ok, failed: [${failedViews.join(',') || 'none'}]`);

      if (okCount === 0) {
        throw new Error('All image generations failed. Please try again.');
      }

      // Message: fall back to default if it failed.
      const msgRes = messageSettled[0];
      if (msgRes.status === 'fulfilled') {
        greetingMessage = msgRes.value;
      } else {
        console.error('Message generation failed, using default:', msgRes.reason?.message);
        greetingMessage = `Happy ${occasion || 'Birthday'}, ${name}! Wishing you a day filled with joy and celebration!`;
      }
    } catch (error) {
      const m = error instanceof Error ? error.message : String(error);
      if (m === 'RATE_LIMIT') {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (m === 'CREDITS_EXHAUSTED') {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits and try again.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        images: generatedImages,
        imageLabels,
        generateBothStyles,
        failedViews,
        greetingMessage,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-complete-cake:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
