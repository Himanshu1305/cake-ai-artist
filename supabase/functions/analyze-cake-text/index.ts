import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the vision analysis prompt with detailed instructions
    const prompt = `You are an expert cake decorator analyzing a cake image to determine the optimal placement for a name decoration.

CRITICAL RULES - READ CAREFULLY:
1. **FIND BLANK FONDANT FIRST**: Look for the LARGEST area of plain, smooth, WHITE/CREAM/LIGHT-COLORED fondant with NO decorations, NO characters, NO patterns. This is your PRIMARY target!
2. **AVOID BUSY AREAS**: NEVER place text on decorations, characters, flowers, patterns, or textured areas
3. **USE LARGE FONT SIZES**: On blank fondant, use fontSize 42-50px for maximum readability
4. **PREFER BLUE COLOR**: Default to blue (#2563EB) for high contrast against light fondant, unless the cake has blue tones (then use pink #D4687A)
5. **FOR TOP-DOWN VIEWS**: Text must be ON the cake surface (y: 0.35-0.50), NOT on labels or stands below

Analyze this cake and determine:
1. Where is the LARGEST area of plain, blank, white/cream fondant?
2. Are there any decorations, characters, or patterns to avoid?
3. What color provides the best contrast against the fondant?
4. What's the view type (front, side, top-down, diagonal)?

The name to be written is: "${recipientName}"

PLACEMENT STRATEGY BY VIEW:
- FRONT VIEW: Find blank fondant on middle/bottom tier (y: 0.60-0.75), fontSize 42-48px
- SIDE VIEW: Look for undecorated tier side (y: 0.55-0.70), fontSize 40-48px
- TOP-DOWN VIEW: Center on blank top surface (y: 0.40-0.55), AVOID borders/edges, fontSize 42-50px
- DIAGONAL VIEW: Target visible blank fondant tier (y: 0.65-0.75), fontSize 42-50px

COLOR PRIORITY:
1. **BLUE (#2563EB)** - DEFAULT for white/cream/light fondant (best visibility)
2. Pink (#D4687A, #E8B4C8) - If cake has blue tones or decorations
3. Dark chocolate (#5D3A1A, #8B4513) - Only if fondant is very light and blue doesn't fit theme
4. White (#F5F5DC) - Only if cake is dark colored

Return ONLY valid JSON (no markdown, no explanation):
{
  "x": 0.5,
  "y": 0.65,
  "fontSize": 45,
  "color": "#2563EB",
  "rotation": 0,
  "fontStyle": "elegant"
}

Where:
- x: horizontal position (0-1, 0.5 is center on blank fondant)
- y: vertical position (0-1) - CENTER of the blank fondant area
- fontSize: 40-50 pixels (maximize size on blank areas!)
- color: hex color - prioritize BLUE (#2563EB) for visibility
- rotation: -10 to 10 degrees for natural look (keep minimal)
- fontStyle: "elegant" (formal/wedding), "playful" (children's), "classic" (traditional)`;

    console.log('Analyzing cake image for recipient:', recipientName);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      console.error('No content in AI response:', data);
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

      // Validate and constrain the parameters
      textParams.x = Math.max(0.1, Math.min(0.9, textParams.x || 0.5));
      textParams.y = Math.max(0.1, Math.min(0.9, textParams.y || 0.65));
      textParams.fontSize = Math.max(20, Math.min(50, textParams.fontSize || 32));
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
        fontSize: 42,
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
        fontSize: 42,
        color: '#2563EB',
        rotation: 0,
        fontStyle: 'elegant'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
