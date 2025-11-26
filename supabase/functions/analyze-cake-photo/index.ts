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
    const { cakeImageUrl, userPhotoUrl } = await req.json();
    
    if (!cakeImageUrl || !userPhotoUrl) {
      throw new Error('Both cakeImageUrl and userPhotoUrl are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing cake for photo placement...');

    const prompt = `You are an expert cake decorator analyzing a cake image to determine the optimal placement for a user's photo on the cake surface.

CRITICAL RULES:
1. PRIORITIZE BLANK FONDANT AREAS - Look for large, smooth, light-colored (white/cream/light pink) fondant surfaces
2. AVOID DECORATIONS - Never place photo over characters, patterns, flowers, piped decorations, or busy areas
3. CENTER PLACEMENT - For top-down views, favor center placement; for front views, favor upper-center areas
4. SIZE APPROPRIATELY - Photo should be prominent but not overwhelm the cake (typically 30-50% of visible surface)
5. CIRCULAR SHAPE PREFERRED - Most edible photo prints are circular for aesthetic appeal
6. ENSURE CONTRAST - Choose position where photo won't blend with background decorations

ANALYZE THE CAKE IMAGE AND RETURN ONLY A JSON OBJECT with these exact keys:
{
  "x": <number between 0 and 1 representing horizontal position, 0.5 is center>,
  "y": <number between 0 and 1 representing vertical position, 0.5 is center>,
  "size": <number between 0.25 and 0.6 representing photo size as percentage of cake width>,
  "shape": <"circle" or "rectangle", prefer circle for edible prints>,
  "rotation": <number between -15 and 15 for slight rotation in degrees, usually 0>,
  "borderColor": <hex color for decorative border around photo, usually "#ffffff" or a complementary color>,
  "borderWidth": <number between 2 and 8 for border thickness in pixels>
}

IMPORTANT: Return ONLY the JSON object, no other text or explanation.`;

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
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: cakeImageUrl } },
              { type: 'image_url', image_url: { url: userPhotoUrl } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

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

      // Validate and constrain values
      photoParams.x = Math.max(0.2, Math.min(0.8, photoParams.x || 0.5));
      photoParams.y = Math.max(0.2, Math.min(0.8, photoParams.y || 0.5));
      photoParams.size = Math.max(0.25, Math.min(0.6, photoParams.size || 0.4));
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
        size: 0.4,
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
    const defaultParams = {
      x: 0.5,
      y: 0.5,
      size: 0.4,
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
