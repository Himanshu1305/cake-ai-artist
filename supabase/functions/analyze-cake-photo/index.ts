// ============================================
// FALLBACK: Used by original N8N + overlay solution
// This edge function is preserved for fallback purposes
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CHAT_MODEL_DEFAULT } from "../_shared/ai-models.ts";
import { generateText } from "../_shared/gemini-client.ts";

// Convert an image URL (remote http(s) or a data: URL) to inline base64 for
// Gemini vision. The gateway fetched remote URLs server-side; we do it explicitly.
async function toInlineImage(src: string): Promise<{ base64: string; mimeType: string }> {
  const dataMatch = src.match(/^data:([^;]+);base64,(.*)$/);
  if (dataMatch) return { mimeType: dataMatch[1], base64: dataMatch[2] };
  const resp = await fetch(src);
  if (!resp.ok) throw new Error(`Failed to fetch image (${resp.status})`);
  const mimeType = resp.headers.get("content-type") || "image/jpeg";
  const buf = new Uint8Array(await resp.arrayBuffer());
  let binary = "";
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
  return { base64: btoa(binary), mimeType };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cakeImageUrl, userPhotoUrl, viewType } = await req.json();
    
    if (!cakeImageUrl || !userPhotoUrl) {
      throw new Error('Both cakeImageUrl and userPhotoUrl are required');
    }

    console.log('Analyzing cake for photo placement, view type:', viewType);

    // View-specific instructions for better AI placement
    const viewSpecificInstructions = viewType === 'top' 
      ? `**TOP-DOWN VIEW DETECTED**:
- The cake is shown from DIRECTLY ABOVE
- The ENTIRE CIRCULAR TOP SURFACE is your target area
- Photo MUST be CENTERED at x: 0.5, y: 0.5 (exact center)
- Photo MUST COVER THE ENTIRE TOP FONDANT (size: 0.60-0.75)
- This is an edible photo print that will cover the whole cake top
- DO NOT place photo near edges - it should fill the center area completely`
      : `**FRONT/SIDE/DIAGONAL VIEW DETECTED**:
- Look for the largest blank fondant surface area
- Position photo prominently (size: 0.35-0.50)
- Center horizontally (x: 0.5) and position on visible tier`;

    const prompt = `You are an expert cake decorator analyzing a cake image to determine the optimal placement for a user's photo on the cake surface.

${viewSpecificInstructions}

CRITICAL RULES:
1. **PRIORITIZE BLANK FONDANT AREAS** - Look for large, smooth, light-colored (white/cream/light pink) fondant surfaces
2. **AVOID DECORATIONS** - Never place photo over characters, patterns, flowers, piped decorations, or busy areas
3. **SIZE APPROPRIATELY** - Photo should be prominent:
   - TOP-DOWN VIEW: 0.60-0.75 to COVER ENTIRE TOP
   - OTHER VIEWS: 0.35-0.50 for balanced appearance
4. **CENTER POSITIONING** - For top-down views, ALWAYS use x: 0.5, y: 0.5 (exact center)
5. **CIRCULAR SHAPE PREFERRED** - Most edible photo prints are circular for aesthetic appeal
6. **ENSURE CONTRAST** - Choose position where photo won't blend with background decorations

ANALYZE THE CAKE IMAGE AND RETURN ONLY A JSON OBJECT with these exact keys:
{
  "x": <number 0-1, horizontal position - 0.5 is CENTER (use 0.5 for top-down views!)>,
  "y": <number 0-1, vertical position - 0.5 is CENTER (use 0.5 for top-down views!)>,
  "size": <number 0.30-0.80 - USE 0.60-0.75 for top-down, 0.35-0.50 for other views>,
  "shape": <"circle" or "rectangle", prefer circle for edible prints>,
  "rotation": <number -15 to 15 degrees, usually 0>,
  "borderColor": <hex color for decorative border, usually "#ffffff">,
  "borderWidth": <number 2-8 for border thickness in pixels>
}

IMPORTANT: Return ONLY the JSON object, no other text or explanation.`;

    const [cakeImg, userImg] = await Promise.all([
      toInlineImage(cakeImageUrl),
      toInlineImage(userPhotoUrl),
    ]);

    const aiResponse = await generateText({
      model: CHAT_MODEL_DEFAULT,
      messages: [
        { role: 'user', content: prompt, images: [cakeImg, userImg] },
      ],
    });

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('AI response:', aiResponse);

    // Parse JSON from AI response
    let photoParams;
    try {
      // Extract JSON from response (AI might wrap it in markdown code blocks)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        photoParams = JSON.parse(jsonMatch[0]);
      } else {
        photoParams = JSON.parse(aiResponse);
      }

      // Validate and constrain values with larger size range
      photoParams.x = Math.max(0.2, Math.min(0.8, photoParams.x || 0.5));
      photoParams.y = Math.max(0.2, Math.min(0.8, photoParams.y || 0.5));
      photoParams.size = Math.max(0.30, Math.min(0.80, photoParams.size || 0.5));
      photoParams.shape = ['circle', 'rectangle'].includes(photoParams.shape) ? photoParams.shape : 'circle';
      photoParams.rotation = Math.max(-15, Math.min(15, photoParams.rotation || 0));
      photoParams.borderColor = photoParams.borderColor || '#ffffff';
      photoParams.borderWidth = Math.max(2, Math.min(8, photoParams.borderWidth || 4));

      console.log('Parsed photo parameters:', photoParams);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return default parameters if parsing fails
      photoParams = {
        x: 0.5,
        y: 0.5,
        size: viewType === 'top' ? 0.65 : 0.4,
        shape: 'circle',
        rotation: 0,
        borderColor: '#ffffff',
        borderWidth: 4
      };
    }

    return new Response(
      JSON.stringify({ success: true, params: photoParams }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-cake-photo:', error);
    
    // Return default safe parameters on error
    const { viewType } = await req.json().catch(() => ({ viewType: 'top' }));
    const defaultParams = {
      x: 0.5,
      y: 0.5,
      size: viewType === 'top' ? 0.65 : 0.4,
      shape: 'circle',
      rotation: 0,
      borderColor: '#ffffff',
      borderWidth: 4
    };

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        params: defaultParams 
      }),
      { 
        status: 200, // Return 200 with default params so app continues working
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
