import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { cakeImageId, name, occasion, theme, colors, character } = await req.json();

    if (!cakeImageId || !name || !occasion) {
      throw new Error("Missing required fields");
    }

    console.log(`Generating party pack for user ${user.id}, cake ${cakeImageId}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const themeDesc = theme || character || "elegant celebration";
    const colorDesc = colors || "gold, white, and pastel";

    // Simplified, direct prompts for image generation
    const items = [
      {
        type: "invitation",
        prompt: `Generate a party invitation card image. ${occasion} party for ${name}. ${themeDesc} theme with ${colorDesc} colors. Include placeholder text for Date, Time, Location, RSVP. 5x7 inch format, professional print quality.`
      },
      {
        type: "thank_you_card",
        prompt: `Generate a thank you card image. "Thank You" prominently displayed. From ${name}, ${occasion} theme. ${themeDesc} style with ${colorDesc} colors. Folded card format, elegant design.`
      },
      {
        type: "banner",
        prompt: `Generate a party banner image with the text "Happy ${occasion} ${name}" in large decorative letters. ${themeDesc} theme, ${colorDesc} colors. Festive, bold letters suitable for cutting out.`
      },
      {
        type: "cake_topper",
        prompt: `Generate a cake topper design image with "${name}" text and "${occasion}" label. ${themeDesc} theme, ${colorDesc} colors. Circular or flag shape, printable with cut lines shown.`
      },
      {
        type: "place_cards",
        prompt: `Generate a set of 6 place card templates on one sheet. ${occasion} theme for ${name}'s party. ${themeDesc} style, ${colorDesc} colors. Tent-fold cards with space for guest names.`
      }
    ];

    const generateImage = async (itemPrompt: string, itemType: string) => {
      console.log(`Generating ${itemType}...`);
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: itemPrompt
            }
          ],
          modalities: ["image", "text"]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI generation failed for ${itemType}: ${response.status} - ${errorText}`);
        
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a few moments.");
        }
        if (response.status === 402) {
          throw new Error("AI credits depleted. Please add funds to your Lovable workspace.");
        }
        
        throw new Error(`Failed to generate ${itemType}: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!imageUrl) {
        console.error(`No image returned for ${itemType}. Content:`, data.choices?.[0]?.message?.content?.substring(0, 200));
        throw new Error(`No image returned for ${itemType}`);
      }

      console.log(`Successfully generated ${itemType}`);
      return imageUrl;
    };

    // Generate all items in parallel
    console.log("Starting parallel generation of all 5 party items...");
    const generatedImages = await Promise.all(
      items.map(item => generateImage(item.prompt, item.type))
    );

    // Upload all images to storage
    const uploadPromises = generatedImages.map(async (base64Image, index) => {
      const itemType = items[index].type;
      const base64Data = base64Image.split(",")[1];
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const fileName = `${user.id}/${cakeImageId}_${itemType}_${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("party-packs")
        .upload(fileName, buffer, {
          contentType: "image/png",
          upsert: false
        });

      if (uploadError) {
        console.error(`Upload error for ${itemType}:`, uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("party-packs")
        .getPublicUrl(fileName);

      return { type: itemType, url: publicUrl };
    });

    const uploadedItems = await Promise.all(uploadPromises);
    console.log("All items uploaded successfully");

    // Create record in database
    const partyPackData = {
      user_id: user.id,
      cake_image_id: cakeImageId,
      invitation_url: uploadedItems.find(i => i.type === "invitation")!.url,
      thank_you_card_url: uploadedItems.find(i => i.type === "thank_you_card")!.url,
      banner_url: uploadedItems.find(i => i.type === "banner")!.url,
      cake_topper_url: uploadedItems.find(i => i.type === "cake_topper")!.url,
      place_cards_url: uploadedItems.find(i => i.type === "place_cards")!.url
    };

    const { data: partyPack, error: insertError } = await supabase
      .from("party_packs")
      .insert(partyPackData)
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    console.log("Party pack created successfully:", partyPack.id);

    return new Response(
      JSON.stringify({ success: true, partyPack }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-party-pack:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
