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

    // Get occasion-specific text for the cake
    const getOccasionText = (occ: string): string => {
      const texts: Record<string, string> = {
        'birthday': 'Happy Birthday',
        'anniversary': 'Happy Anniversary',
        'wedding': 'Congratulations',
        'graduation': 'Congratulations',
        'baby-shower': 'Welcome Baby',
        'engagement': 'Congratulations',
        'promotion': 'Congratulations',
        'retirement': 'Happy Retirement',
        'other': 'Celebrations'
      };
      return texts[occ] || 'Happy Birthday';
    };

    const occasionText = getOccasionText(occasion || 'birthday');

    // Build view-specific prompts with name and photo baked in
    const viewAngles = [
      { 
        name: 'front', 
        description: 'Professional food photography of a SINGLE, COMPLETE luxurious cake from the FRONT VIEW, camera at eye level. The ENTIRE cake must be visible in frame - from the top decorations down to the cake stand/pedestal base. NO CROPPING. Full view of all cake tiers.',
        namePosition: 'on the bottom tier front face or cake board, centered horizontally',
        occasionPosition: 'prominently on the middle or top tier in large, elegant letters',
        photoPosition: 'on the middle tier center face' 
      },
      { 
        name: 'side', 
        description: 'Professional food photography of a SINGLE, COMPLETE luxurious cake from the SIDE VIEW, camera perpendicular. The ENTIRE cake must be visible - from top to bottom including the cake stand. NO CROPPING. Show the depth of all layers and decorations.',
        namePosition: 'on the visible tier side panel',
        occasionPosition: 'on another tier or fondant plaque on the side',
        photoPosition: 'on the visible side of the top tier'
      },
      { 
        name: 'top', 
        description: 'Professional food photography of a SINGLE, COMPLETE luxurious cake from DIRECTLY ABOVE (bird\'s eye view). Show the entire circular top surface AND the cake stand edge visible around the cake. The complete structure must be visible without cropping.',
        namePosition: 'elegantly around the outer edge or on a decorative banner',
        occasionPosition: 'centered on the top surface or on decorative ribbon (if no photo present)',
        photoPosition: 'covering the ENTIRE top surface of the cake from edge to edge'
      },
      { 
        name: 'diagonal', 
        description: 'Professional food photography of a SINGLE, COMPLETE luxurious cake from a 45-degree DIAGONAL VIEW. Show both the top and front details. The ENTIRE cake must be visible - all tiers from top decorations to cake stand. NO CROPPING. Cinematic composition.',
        namePosition: 'on a visible fondant plaque at the cake base',
        occasionPosition: 'on the most visible tier face in prominent lettering',
        photoPosition: 'on the most visible tier face'
      }
    ];

    // Helper function to generate a single view with retry logic
    const generateView = async (view: typeof viewAngles[0], retries = 2): Promise<string> => {
      // Special handling for top-down view with photo
      if (userPhotoBase64 && view.name === 'top') {
        const topPrompt = `${view.description}

CRITICAL COMPOSITION RULES:
- Generate EXACTLY ONE CAKE in the image - no comparison, no multiple cakes
- The COMPLETE cake must be visible from top to bottom with adequate padding
- Include the luxurious marble pedestal/cake stand in the frame

The top surface features a large, circular edible photo print that COVERS THE ENTIRE TOP of the cake from edge to edge, showing the provided reference image. The photo is the centerpiece surrounded by ${theme || 'elegant'} decorative borders.

CRITICAL TEXT ON CAKE:
- Display the name "${name}" elegantly ${view.namePosition} in beautiful fondant script
- Text must be clearly readable and in a complementary color (gold, pink #D4687A, or blue #2563EB)
- EXACT SPELLING: ${name.split('').join('-')}
- DO NOT add occasion text on top when there's a photo - the photo IS the centerpiece

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
            model: 'google/gemini-3-pro-image-preview',
            messages: topMessages,
            modalities: ['image', 'text']
          }),
        });

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          console.error(`Image generation failed for ${view.name}:`, imageResponse.status, errorText);
          if (imageResponse.status === 429) throw new Error('RATE_LIMIT');
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
- Generate EXACTLY ONE CAKE in the image - no comparison, no multiple cakes
- The COMPLETE cake must be visible from top to bottom with adequate padding
- Include the luxurious marble pedestal/cake stand in the frame

CRITICAL TEXT ON CAKE:
- Display "${occasionText}" prominently ${view.occasionPosition} in elegant fondant/icing lettering
- Display the name "${name}" ${view.namePosition} in beautiful script
- Text must be clearly readable, large, and in complementary colors (gold, pink #D4687A, or blue #2563EB)
- EXACT SPELLING for name: ${name.split('').join('-')}
- DO NOT repeat any text - show each text element ONCE only

Cake specifications:
- Style: ${layers || '2-tier'} ${cakeType || 'fondant'} cake
- Theme: ${theme || 'elegant celebration'}
- Color scheme: ${colors || 'soft pastels with white base'}`;

      if (character) {
        prompt += `\n- Character: ${character} themed decorations and figurines placed tastefully`;
      }

      prompt += `\n\nStandard photography specifications: luxurious marble pedestal, soft studio lighting, shallow depth of field, hyper-realistic detail, cinematic composition, 8K resolution, professional food photography, award-winning pastry art aesthetic.`;


      console.log(`Generating ${view.name} view...`);

      // Prepare messages
      const messages: any[] = [
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
          throw new Error('RATE_LIMIT');
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

    // Generate images in parallel (2 at a time to avoid rate limits)
    let generatedImages: string[] = [];
    
    try {
      console.log('Starting parallel batch 1 (front + side)...');
      const batch1 = await Promise.all([
        generateView(viewAngles[0]), // front
        generateView(viewAngles[1])  // side
      ]);
      
      // Brief pause between batches (reduced from 2000ms for faster generation)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Starting parallel batch 2 (top + diagonal)...');
      const batch2 = await Promise.all([
        generateView(viewAngles[2]), // top
        generateView(viewAngles[3])  // diagonal
      ]);
      
      generatedImages = [...batch1, ...batch2];
    
    } catch (error) {
      if (error instanceof Error && error.message === 'RATE_LIMIT') {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    // Helper function to get inverse relationship (who is writing to whom)
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

    // Helper function to provide relationship-specific emotional guidance
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

    // Helper function to provide example messages for context
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
      return '';
    };

    // Generate personalized greeting message
    console.log('Generating greeting message...');
    const inverseRel = getInverseRelation(relation);
    const messagePrompt = `You are writing a heartfelt ${occasion || 'birthday'} message FROM someone TO their ${relation}.

RECIPIENT DETAILS:
- Name: ${name}
- Relationship to sender: ${relation} (meaning the sender is the ${inverseRel})
- Gender: ${gender || 'other'}
- Occasion: ${occasion || 'birthday'}

YOUR TASK:
Write a 2-3 sentence message that:
1. Speaks AS the ${inverseRel} writing TO their ${relation}
2. Uses ${gender === 'female' ? 'feminine' : gender === 'male' ? 'masculine' : 'neutral'} language appropriate for ${name}
3. Captures the emotional depth and warmth of the ${relation} relationship from the ${inverseRel}'s perspective
4. Feels deeply personal, genuine, and emotionally resonant – NOT generic or AI-like

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
