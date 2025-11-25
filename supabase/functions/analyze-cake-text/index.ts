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

    // Prepare the vision analysis prompt
    const prompt = `You are an expert cake decorator analyzing a cake image to determine the optimal placement for a name decoration.

Analyze this cake image and determine:
1. Where is the largest flat fondant or frosting surface suitable for text?
2. What color would contrast well with the cake's color scheme while looking like natural frosting?
3. How large should the text be relative to the cake size and available space?
4. Should the text be slightly angled to follow the cake's perspective or surface curvature?

The name to be written is: "${recipientName}"

Consider:
- Avoid placing text over detailed decorations, characters, or intricate patterns
- Choose text color that looks like realistic frosting (pastel pinks, chocolates, whites, creams)
- Ensure text fits comfortably in the available space without crowding
- Slight rotation (-15 to 15 degrees) can make text look more hand-piped and natural

Return ONLY a valid JSON object with these exact fields (no markdown, no explanation):
{
  "x": 0.5,
  "y": 0.65,
  "fontSize": 32,
  "color": "#D4687A",
  "rotation": 0,
  "fontStyle": "elegant"
}

Where:
- x: horizontal position (0-1, 0.5 is center)
- y: vertical position (0-1, 0 is top, 1 is bottom)
- fontSize: recommended size (20-50 pixels)
- color: hex color that contrasts well and looks like frosting
- rotation: angle in degrees (-15 to 15)
- fontStyle: "elegant" for formal cakes, "playful" for children's cakes, "classic" for traditional`;

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
