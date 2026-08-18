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
    const { imageUrl, recipientName } = await req.json();
    
    if (!imageUrl || !recipientName) {
      return new Response(
        JSON.stringify({ error: 'Missing imageUrl or recipientName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the vision analysis prompt with detailed instructions
    const prompt = `You are an expert cake decorator analyzing a cake image to determine the optimal placement for a name decoration.

CRITICAL RULES - READ CAREFULLY AND FOLLOW EXACTLY:

**STEP 1: FIND WHITE/CREAM FONDANT**
- SCAN the entire image SYSTEMATICALLY from TOP to BOTTOM, LEFT to RIGHT
- IDENTIFY the LARGEST continuous area of WHITE, CREAM, or LIGHT-COLORED fondant
- This fondant area MUST be PLAIN, SMOOTH, with NO decorations, NO characters, NO patterns, NO textures
- If NO clear white/cream fondant exists, use the LIGHTEST tier at y: 0.70

**STEP 2: ANALYZE BACKGROUND COLOR**
- Look at the TARGET AREA you identified in Step 1
- Determine the EXACT color of that fondant area
- This will determine your text color choice

**STEP 3: CHOOSE TEXT COLOR FOR MAXIMUM CONTRAST**
Based on the TARGET AREA background color:
- **WHITE/CREAM/LIGHT FONDANT** → Use BLUE (#2563EB) or DEEP PURPLE (#4C1D95)
- **BLUE/TEAL FONDANT** → Use PINK (#D4687A) or CORAL (#F97316)
- **DARK COLORED CAKE** → Use WHITE (#FFFFFF)
- DEFAULT if unsure → BLUE (#2563EB)

**STEP 4: MAXIMIZE FONT SIZE**
- Use LARGE fonts for readability: 45-55px for front/diagonal, 42-50px for side/top
- The blank fondant allows for BIGGER text = better visibility

**NEGATIVE EXAMPLES (NEVER DO THIS):**
❌ Placing text on colorful Mickey Mouse decorations
❌ Placing text on patterned areas or busy backgrounds
❌ Using small fonts (under 40px) when space allows larger
❌ Placing text at edges or borders of the cake

The name to be written is: "${recipientName}"

**PLACEMENT STRATEGY BY VIEW:**
- **FRONT VIEW**: Find blank fondant on middle/bottom tier (y: 0.60-0.75), fontSize 45-55px
- **SIDE VIEW**: Look for undecorated tier side (y: 0.55-0.70), fontSize 42-50px, if no white fondant use y: 0.70
- **TOP-DOWN VIEW**: Center on blank top surface (y: 0.40-0.55), fontSize 42-50px
- **DIAGONAL VIEW**: Target visible blank fondant tier (y: 0.65-0.75), fontSize 45-55px

Return ONLY valid JSON (no markdown, no explanation):
{
  "x": 0.5,
  "y": 0.65,
  "fontSize": 48,
  "color": "#2563EB",
  "rotation": 0,
  "fontStyle": "elegant"
}

Where:
- x: horizontal position (0-1, 0.5 is center on blank fondant)
- y: vertical position (0-1) - CENTER of the blank fondant area
- fontSize: 42-55 pixels (LARGER is better for readability!)
- color: hex color - MUST contrast with background (analyze fondant color first!)
- rotation: -10 to 10 degrees for natural look (keep minimal)
- fontStyle: "elegant" (formal/wedding), "playful" (children's), "classic" (traditional)`;

    console.log('Analyzing cake image for recipient:', recipientName);

    let aiResponse: string;
    try {
      const img = await toInlineImage(imageUrl);
      aiResponse = await generateText({
        model: CHAT_MODEL_DEFAULT,
        messages: [
          { role: 'user', content: prompt, images: [img] },
        ],
        temperature: 0.3,
        maxOutputTokens: 200,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Gemini AI error:', msg);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed', details: msg }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!aiResponse) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'No analysis result from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI response:', aiResponse);

    // Parse the AI response to extract JSON
    let textParams;
    try {
      // Try to extract JSON from potential markdown code blocks
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        textParams = JSON.parse(jsonMatch[0]);
      } else {
        textParams = JSON.parse(aiResponse);
      }

      // Validate and constrain the parameters with larger font sizes
      textParams.x = Math.max(0.1, Math.min(0.9, textParams.x || 0.5));
      textParams.y = Math.max(0.1, Math.min(0.9, textParams.y || 0.65));
      textParams.fontSize = Math.max(20, Math.min(55, textParams.fontSize || 45));
      textParams.rotation = Math.max(-15, Math.min(15, textParams.rotation || 0));
      
      // Ensure color is a valid hex
      if (!textParams.color || !/^#[0-9A-Fa-f]{6}$/.test(textParams.color)) {
        textParams.color = '#2563EB';
      }

      // Ensure fontStyle is valid
      if (!['elegant', 'playful', 'classic'].includes(textParams.fontStyle)) {
        textParams.fontStyle = 'elegant';
      }

      console.log('Parsed text parameters:', textParams);

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Response:', aiResponse);
      // Return default parameters if parsing fails
      textParams = {
        x: 0.5,
        y: 0.65,
        fontSize: 48,
        color: '#2563EB',
        rotation: 0,
        fontStyle: 'elegant'
      };
    }

    return new Response(
      JSON.stringify(textParams),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-cake-text function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        // Return safe defaults on error
        x: 0.5,
        y: 0.65,
        fontSize: 48,
        color: '#2563EB',
        rotation: 0,
        fontStyle: 'elegant'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
