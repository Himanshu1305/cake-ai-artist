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

    // Model selection based on quality setting
    const imageModel = quality === 'high' 
      ? 'google/gemini-3-pro-image-preview' 
      : 'google/gemini-2.5-flash-image';

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

    // Sculpted cake view angles (2 views only - for character-shaped cakes)
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
        name: 'top', 
        description: 'Professional food photography of a SINGLE, COMPLETE luxurious cake from DIRECTLY ABOVE (bird\'s eye view). Frame the shot to FILL THE IMAGE with the cake - the cake should occupy most of the frame with minimal empty space. Show the entire circular top surface with just a hint of the cake stand edge. MINIMIZE BLANK SPACE above and below the cake. The cake should be the dominant element filling 80-90% of the frame.',
        namePosition: 'elegantly around the outer edge or on a decorative banner',
        occasionPosition: 'prominently on the top surface in elegant fondant letters (even when photo is present)',
        photoPosition: 'covering the ENTIRE top surface of the cake from edge to edge'
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
        description: 'Professional food photography of a SINGLE, COMPLETE luxurious cake from DIRECTLY ABOVE (bird\'s eye view). Frame the shot to FILL THE IMAGE with the cake - the cake should occupy most of the frame with minimal empty space. Show the entire circular top surface with just a hint of the cake stand edge. MINIMIZE BLANK SPACE above and below the cake. The cake should be the dominant element filling 80-90% of the frame.',
        namePosition: 'elegantly around the outer edge or on a decorative banner',
        occasionPosition: 'prominently on the top surface in elegant fondant letters (even when photo is present)',
        photoPosition: 'covering the ENTIRE top surface of the cake from edge to edge'
      }
    ];

    // Determine if we should generate both styles (when character is selected)
    const generateBothStyles = !!character && !specificView;
    
    // Select view angles based on cake style (or both if character selected)
    const viewAngles = cakeStyle === 'sculpted' ? sculptedViewAngles : decoratedViewAngles;

    // Helper function to generate a single view with retry logic
    const generateView = async (view: typeof viewAngles[0], retries = 2): Promise<string> => {
      // Special handling for top-down view with photo
      if (userPhotoBase64 && view.name === 'top') {
        const topPrompt = `${view.description}

CRITICAL COMPOSITION RULES:
- Generate EXACTLY ONE CAKE in the image
- DO NOT generate a collage, comparison, side-by-side, or before/after image
- DO NOT show multiple angles in one image - just ONE view of ONE cake
- The single cake must be centered on a marble pedestal
- The COMPLETE cake must be visible from top to bottom with adequate padding

The top surface features a large, circular edible photo print that COVERS THE ENTIRE TOP of the cake from edge to edge, showing the provided reference image. The photo is the centerpiece surrounded by ${theme || 'elegant'} decorative borders.

CRITICAL TEXT ON CAKE:
- Display "${occasionText}" or "HBD" prominently ${view.occasionPosition} in elegant fondant letters
- Display the name "${name}" elegantly ${view.namePosition} in beautiful fondant script
- Text must be clearly readable and in a complementary color (gold, pink #D4687A, or blue #2563EB)
- EXACT SPELLING for name: ${name.split('').join('-')}
- The photo AND the text together create an inspiring, complete design

Cake specifications:
- Style: ${layers || '2-tier'} ${cakeType || 'fondant'} cake
- Theme: ${theme || 'elegant celebration'}
- Color scheme: ${colors || 'soft pastels with white base'}`;

        const topMessages: any[] = [
          {
            role: 'user',
            content: [
              { type: 'text', text: topPrompt },
              { 
                type: 'image_url', 
                image_url: { url: `data:image/jpeg;base64,${userPhotoBase64}` } 
              }
            ]
          }
        ];

        console.log(`Generating ${view.name} view...`);

        const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: imageModel,
            messages: topMessages,
            modalities: ['image', 'text']
          }),
        });

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          console.error(`Image generation failed for ${view.name}:`, imageResponse.status, errorText);
          if (imageResponse.status === 429) throw new Error('RATE_LIMIT');
          if (imageResponse.status === 402) throw new Error('CREDITS_EXHAUSTED');
          if (imageResponse.status === 503 && retries > 0) {
            console.log(`Retrying ${view.name} view after 503 error (${retries} retries left)...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return generateView(view, retries - 1);
          }
          throw new Error(`Image generation failed: ${imageResponse.status}`);
        }

        const imageData = await imageResponse.json();
        const generatedImageBase64 = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (!generatedImageBase64) throw new Error(`No image returned for ${view.name} view`);
        console.log(`✓ Generated ${view.name} view`);
        return generatedImageBase64;
      }

      // Standard prompt for all non-photo views
      let prompt = `${view.description}

CRITICAL COMPOSITION RULES:
- Generate EXACTLY ONE CAKE in the image
- DO NOT generate a collage, comparison, side-by-side, or before/after image
- DO NOT show multiple angles in one image - just ONE view of ONE cake
- The single cake must be centered on a marble pedestal
- The COMPLETE cake must be visible from top to bottom with adequate padding

CRITICAL TEXT ON CAKE:
- Display "${occasionText}" prominently ${view.occasionPosition} in elegant fondant/icing lettering
- Display the name "${name}" ${view.namePosition} in beautiful script
- Text must be clearly readable, large, and in complementary colors (gold, pink #D4687A, or blue #2563EB)
- EXACT SPELLING for name: ${name.split('').join('-')}
- DO NOT repeat any text - show each text element ONCE only
`;

      // Different cake specifications based on style
      if (cakeStyle === 'sculpted' && view.name === 'main') {
        // Sculpted main view - the cake IS the character but MUST look like a cake
        prompt += `
SCULPTED CAKE SPECIFICATIONS - MUST LOOK LIKE A REAL EDIBLE CAKE:
- This is a 3D SCULPTED character cake INSPIRED BY ${character || 'the character'}
- Made ENTIRELY of visible edible materials: fondant covering, modeling chocolate, cake layers inside, buttercream details
- MUST show visible cake characteristics: fondant texture and seams, handcrafted tool marks, slight imperfections
- The character should be STYLIZED for cake art - cute/rounded/simplified, NOT hyper-realistic like a figurine
- Show the cake sitting on a cake board/drum with decorative piped border around the base
- Include bakery elements: cake stand, decorative base, visible fondant work
- Warm, appetizing FOOD PHOTOGRAPHY lighting (NOT cold studio CGI lighting)
- Theme: ${theme || 'fun celebration'}
- Color scheme: ${colors || 'vibrant but obviously edible-looking fondant colors'}
- CRITICAL: Viewer must IMMEDIATELY recognize this as a handcrafted bakery creation, NOT a toy, figurine, or CGI render
- Do NOT show a tiered/layered cake - this is a sculpted 3D figure cake that IS made of cake`;
      } else if (cakeStyle === 'sculpted' && view.name === 'top') {
        // Sculpted top view - standard decorated cake top
        prompt += `
Cake specifications:
- Style: round ${cakeType || 'fondant'} cake
- Theme: ${theme || 'elegant celebration'} with ${character || ''} themed decorations
- Color scheme: ${colors || 'soft pastels with white base'}`;
      } else {
        // Decorated cake - standard tiered cake with decorations
        prompt += `
Cake specifications:
- Style: ${layers || '2-tier'} ${cakeType || 'fondant'} cake
- Theme: ${theme || 'elegant celebration'}
- Color scheme: ${colors || 'soft pastels with white base'}`;
        
        if (character) {
          prompt += `\n- Character: ${character} themed decorations and figurines placed tastefully`;
        }
      }

      prompt += `\n\nStandard photography specifications: luxurious marble pedestal, soft studio lighting, shallow depth of field, hyper-realistic detail, cinematic composition, 8K resolution, professional food photography, award-winning pastry art aesthetic.`;

      console.log(`Generating ${view.name} view...`);

      // Prepare messages with system instruction - use sculpted-specific system prompt when needed
      const sculptedSystemPrompt = 'You are a professional food photographer specializing in custom sculpted cakes from high-end bakeries. Generate an image of a REAL EDIBLE CAKE that was sculpted by a master pastry chef. The cake should look appetizing and handcrafted - NOT like a plastic figurine, toy, or CGI render. Show visible fondant texture, cake structure, and professional bakery presentation. The lighting should be warm and appetizing like food photography.';
      
      const standardSystemPrompt = 'You are a professional food photographer. Generate a single high-quality photograph of ONE cake. Never generate collages, comparisons, or multiple cakes in one image.';
      
      const messages: any[] = [
        {
          role: 'system',
          content: (cakeStyle === 'sculpted' && view.name === 'main') ? sculptedSystemPrompt : standardSystemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      // Generate image with Lovable AI
      const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: imageModel,
          messages: messages,
          modalities: ['image', 'text']
        }),
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error(`Image generation failed for ${view.name}:`, imageResponse.status, errorText);
        
        // Handle rate limits gracefully
        if (imageResponse.status === 429) {
          throw new Error('RATE_LIMIT');
        }
        
        if (imageResponse.status === 402) {
          throw new Error('CREDITS_EXHAUSTED');
        }
        
        // Retry on 503 errors (upstream connection issues)
        if (imageResponse.status === 503 && retries > 0) {
          console.log(`Retrying ${view.name} view after 503 error (${retries} retries left)...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return generateView(view, retries - 1);
        }
        
        throw new Error(`Image generation failed: ${imageResponse.status}`);
      }

      const imageData = await imageResponse.json();
      const generatedImageBase64 = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!generatedImageBase64) {
        throw new Error(`No image returned for ${view.name} view`);
      }

      console.log(`✓ Generated ${view.name} view`);
      return generatedImageBase64;
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

    // Message generation function
    const generateMessageAsync = async (): Promise<string> => {
      const inverseRel = getInverseRelation(relation);
      const occasionGuidance = getOccasionGuidance(occasion || 'birthday');
      const messagePrompt = `You are writing a heartfelt ${occasion || 'birthday'} message FROM someone TO their ${relation}.

RECIPIENT DETAILS:
- Name: ${name}
- Relationship to sender: ${relation} (meaning the sender is the ${inverseRel})
- Gender: ${gender || 'other'}
- Occasion: ${occasion || 'birthday'}

${occasionGuidance}

YOUR TASK:
Write a 2-3 sentence message that:
1. Speaks AS the ${inverseRel} writing TO their ${relation}
2. Uses ${gender === 'female' ? 'feminine' : gender === 'male' ? 'masculine' : 'neutral'} language appropriate for ${name}
3. Captures the emotional depth and warmth of the ${relation} relationship from the ${inverseRel}'s perspective
4. Feels deeply personal, genuine, and emotionally resonant – NOT generic or AI-like
5. Uses the CORRECT greeting for the occasion (e.g., "Merry Christmas" for Christmas, "Happy New Year" for New Year, "Happy Birthday" for Birthday)

${getRelationshipGuidance(relation, gender)}

${getExampleMessages(relation, occasion || 'birthday', gender) ? `EXAMPLES of the emotional tone and perspective:\n${getExampleMessages(relation, occasion || 'birthday', gender)}` : ''}

Return ONLY the message text. Make it feel like it came from the heart, not from AI. Do NOT mention the character theme unless it creates a meaningful, natural message.`;

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
    let generatedImages: string[] = [];
    let greetingMessage = '';
    let imageLabels: string[] = [];
    
    try {
      if (specificView) {
        // Regenerate only the specified view
        console.log(`Regenerating only ${specificView} view...`);
        
        // Determine which view angles array to use based on view name
        let viewAnglesToUse = viewAngles;
        let viewStyle: 'decorated' | 'sculpted' = cakeStyle;
        
        // If specificView is 'main', it's a sculpted view
        if (specificView === 'main') {
          viewAnglesToUse = sculptedViewAngles;
          viewStyle = 'sculpted';
        } else if (['front', 'side'].includes(specificView)) {
          viewAnglesToUse = decoratedViewAngles;
          viewStyle = 'decorated';
        }
        // 'top' exists in both, use the cakeStyle to determine
        
        const viewIndex = viewAnglesToUse.findIndex(v => v.name === specificView);
        if (viewIndex === -1) {
          throw new Error(`Invalid view name: ${specificView}`);
        }
        const regeneratedImage = await generateView(viewAnglesToUse[viewIndex]);
        
        return new Response(
          JSON.stringify({ 
            regeneratedImage,
            viewIndex,
            viewName: specificView,
            viewStyle
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
      
      // Generate views AND message in parallel for maximum speed
      if (generateBothStyles) {
        // Character selected: Generate 3 decorated views + 1 sculpted main view = 4 total
        console.log('Starting parallel generation of 4 views (3 decorated + 1 sculpted main) and personalized message...');
        [generatedImages, greetingMessage] = await Promise.all([
          Promise.all([
            generateView(decoratedViewAngles[0]), // front (decorated)
            generateView(decoratedViewAngles[1]), // side (decorated)
            generateView(decoratedViewAngles[2]), // top (decorated)
            generateView(sculptedViewAngles[0])   // main (sculpted - character-shaped)
          ]),
          generateMessageAsync()  // message generation in parallel
        ]);
        imageLabels = ['Front View (Decorated)', 'Side View (Decorated)', 'Top-Down (Decorated)', 'Character-Shaped Cake'];
        console.log('✓ All 4 views and message generated successfully (both styles)');
      } else if (cakeStyle === 'sculpted') {
        // Sculpted cakes: 2 views (main + top)
        console.log('Starting parallel generation of 2 views (sculpted) and personalized message...');
        [generatedImages, greetingMessage] = await Promise.all([
          Promise.all([
            generateView(viewAngles[0]), // main
            generateView(viewAngles[1])  // top
          ]),
          generateMessageAsync()  // message generation in parallel
        ]);
        imageLabels = ['Main View', 'Top-Down View'];
        console.log('✓ All 2 views and message generated successfully (sculpted cake)');
      } else {
        // Decorated cakes: 3 views (front + side + top)
        console.log('Starting parallel generation of all 3 views and personalized message...');
        [generatedImages, greetingMessage] = await Promise.all([
          Promise.all([
            generateView(viewAngles[0]), // front
            generateView(viewAngles[1]), // side
            generateView(viewAngles[2])  // top
          ]),
          generateMessageAsync()  // message generation in parallel
        ]);
        imageLabels = ['Front View', 'Side View', 'Top-Down View'];
        console.log('✓ All 3 views and message generated successfully (decorated cake)');
      }
    
    } catch (error) {
      if (error instanceof Error && error.message === 'RATE_LIMIT') {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        images: generatedImages,
        imageLabels: imageLabels,
        generateBothStyles: generateBothStyles,
        greetingMessage: greetingMessage
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
