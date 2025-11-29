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
    const { 
      name, 
      character, 
      occasion, 
      relation, 
      gender, 
      cakeType, 
      layers, 
      theme, 
      colors, 
      userPhotoBase64 
    } = await req.json();

    console.log('Generate complete cake request:', { name, character, occasion, relation, gender });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build view-specific prompts with name and photo baked in
    const viewAngles = [
      { 
        name: 'front', 
        description: 'Professional food photography of a luxurious cake from the FRONT VIEW, camera at eye level facing the cake directly',
        namePosition: 'on the bottom tier front face, centered horizontally',
        photoPosition: 'on the middle tier center face' 
      },
      { 
        name: 'side', 
        description: 'Professional food photography of a luxurious cake from the SIDE VIEW, camera perpendicular to the cake',
        namePosition: 'on the middle tier side panel, running along the tier',
        photoPosition: 'on the visible side of the top tier'
      },
      { 
        name: 'top', 
        description: 'Professional food photography of a luxurious cake from DIRECTLY ABOVE (bird\'s eye view), showing the entire circular top surface',
        namePosition: 'elegantly arched along the outer edge of the top fondant surface',
        photoPosition: 'in the exact center of the top surface, as a large circular edible print covering most of the fondant'
      },
      { 
        name: 'diagonal', 
        description: 'Professional food photography of a luxurious cake from a 45-degree DIAGONAL VIEW, camera positioned at 45° angle showing multiple sides',
        namePosition: 'on a visible fondant plaque at the cake base or bottom tier',
        photoPosition: 'on the most visible tier face'
      }
    ];

    // Generate 4 cake images with name and photo baked in
    const generatedImages: string[] = [];
    
    for (let i = 0; i < viewAngles.length; i++) {
      const view = viewAngles[i];
      
      // Build prompt with name as fondant lettering
      let prompt = `${view.description}.

The cake MUST prominently display beautiful fondant lettering spelling "${name}" ${view.namePosition}, piped in an elegant script font that looks naturally integrated into the smooth fondant as if professionally decorated by a master cake artist. The name should be clearly readable, large, and in a complementary color (deep blue #2563EB, pink #D4687A, or gold) that contrasts beautifully with the fondant.`;

      // Add photo if provided
      if (userPhotoBase64) {
        prompt += `\n\nThe cake features a ${view.name === 'top' ? 'large circular' : 'circular'} edible photo print ${view.photoPosition}, showing the provided reference image. The photo should look like a professionally printed edible image with a subtle white border, seamlessly integrated into the smooth fondant surface.`;
      }

      // Add cake specifications
      prompt += `\n\nCake specifications:
- Style: ${layers || '2-tier'} ${cakeType || 'fondant'} cake
- Theme: ${theme || 'elegant celebration'}
- Color scheme: ${colors || 'soft pastels with white base'}`;

      if (character) {
        prompt += `\n- Character decorations: ${character} themed fondant decorations and figurines tastefully placed around the tiers`;
      }

      prompt += `\n\nThe cake sits on a luxurious marble pedestal with soft studio lighting, shallow depth of field, hyper-realistic detail, cinematic composition, 8K resolution, award-winning pastry photography aesthetic.`;

      console.log(`Generating ${view.name} view...`);

      // Prepare messages for image generation
      const messages: any[] = [
        {
          role: 'user',
          content: userPhotoBase64 ? [
            { type: 'text', text: prompt },
            { 
              type: 'image_url', 
              image_url: { url: `data:image/jpeg;base64,${userPhotoBase64}` } 
            }
          ] : prompt
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
          model: 'google/gemini-3-pro-image-preview',
          messages: messages,
          modalities: ['image', 'text']
        }),
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error(`Image generation failed for ${view.name}:`, imageResponse.status, errorText);
        
        // Handle rate limits gracefully
        if (imageResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`Image generation failed: ${imageResponse.status}`);
      }

      const imageData = await imageResponse.json();
      const generatedImageBase64 = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!generatedImageBase64) {
        throw new Error(`No image returned for ${view.name} view`);
      }

      generatedImages.push(generatedImageBase64);
      console.log(`✓ Generated ${view.name} view`);

      // Small delay to avoid rate limits (only between images, not after last one)
      if (i < viewAngles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Generate personalized greeting message
    console.log('Generating greeting message...');
    const messagePrompt = `Create a warm, personalized birthday or celebration message for ${name}.

Context:
- Occasion: ${occasion || 'birthday'}
- Relationship: ${relation || 'friend'}
- Gender: ${gender || 'other'}
${character ? `- Theme: ${character}` : ''}

Write a heartfelt 2-3 sentence message that:
1. Addresses ${name} directly
2. References the ${occasion || 'occasion'} appropriately
3. Is warm, genuine, and celebratory
4. Matches the relationship (${relation || 'friend'})

Return ONLY the message text, no quotes, no extra formatting.`;

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
    const greetingMessage = messageData.choices?.[0]?.message?.content?.trim() || 
      `Happy ${occasion || 'Birthday'}, ${name}! Wishing you a day filled with joy and celebration!`;

    console.log('✓ All images and message generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        images: generatedImages,
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
