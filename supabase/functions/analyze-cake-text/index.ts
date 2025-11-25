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

CRITICAL RULES:
1. USE LARGE FONT SIZES: If there's blank fondant space, use fontSize 40-50px. Don't be conservative!
2. FOR TOP-DOWN VIEWS: Text must be ON the cake surface (y: 0.35-0.50), NOT on labels or stands below
3. MAXIMIZE SPACE: Use all available blank areas - bigger is better for readability

Analyze this cake and determine:
1. View type: Is this front, side, top-down, or diagonal view?
2. Available space: Where is the largest flat fondant surface?
3. Decorations: Identify characters, patterns to avoid
4. Optimal placement: Where should text go to be clearly visible?

The name to be written is: "${recipientName}"

SPECIFIC GUIDANCE BY VIEW:
- FRONT VIEW: Center text on middle tier (y: 0.60-0.70), fontSize 38-48px if space available
- SIDE VIEW: Center on visible tier (y: 0.55-0.65), fontSize 35-45px, slight rotation if cake is angled
- TOP-DOWN VIEW: ON the top surface of cake (y: 0.35-0.50), below any top decorations, fontSize 38-48px
- DIAGONAL VIEW: Adjust for perspective (y: 0.65-0.75), fontSize 40-50px on visible tier

COLOR RULES:
- Use colors that look like real frosting: pinks (#D4687A, #E8B4C8), chocolates (#5D3A1A, #8B4513), whites (#F5F5DC), creams (#FFE4B5)
- Ensure contrast with cake color
- Match or complement existing cake colors

Return ONLY valid JSON (no markdown, no explanation):
{
  "x": 0.5,
  "y": 0.65,
  "fontSize": 42,
  "color": "#D4687A",
  "rotation": 0,
  "fontStyle": "elegant"
}

Where:
- x: horizontal position (0-1, 0.5 is center)
- y: vertical position (0-1) - REMEMBER: top-down views need y: 0.35-0.50 to be ON the cake!
- fontSize: 35-50 pixels (use larger sizes when space allows!)
- color: hex color for frosting-like appearance
- rotation: -15 to 15 degrees for natural look
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
        textParams.color = '#D4687A';
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
        fontSize: 32,
        color: '#D4687A',
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
        fontSize: 32,
        color: '#D4687A',
        rotation: 0,
        fontStyle: 'elegant'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
