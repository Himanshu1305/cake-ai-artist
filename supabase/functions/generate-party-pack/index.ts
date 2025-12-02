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

    // Generate all 5 party items in parallel
    const items = [
      {
        type: "invitation",
        prompt: `Create a beautiful party invitation card with these specifications:
- Occasion: ${occasion}
- Recipient: ${name}
- Theme: ${theme || character || "celebration"}
- Colors: ${colors || "festive colors"}
- Include text areas for: Date, Time, Location, RSVP
- Design should match a ${character || "elegant"} theme
- Print-ready format: 5x7 inches, 300 DPI
- Include 0.125" bleed margin
- Professional graphic design quality
- Leave space at bottom for custom text
Style: Modern, elegant, festive, suitable for printing`
      },
      {
        type: "thank_you_card",
        prompt: `Create a beautiful thank you card with these specifications:
- Occasion: ${occasion}
- From: ${name}
- Theme: ${theme || character || "celebration"}
- Colors: ${colors || "festive colors"}
- Include "Thank You" text prominently
- Design should match a ${character || "elegant"} theme
- Print-ready format: 4.25x5.5 inches (folded card), 300 DPI
- Include 0.125" bleed margin
- Leave space for personal message inside
- Professional graphic design quality
Style: Warm, grateful, matching the party theme`
      },
      {
        type: "banner",
        prompt: `Create a festive party banner with these specifications:
- Text: "Happy ${occasion}" and "${name}"
- Theme: ${theme || character || "celebration"}
- Colors: ${colors || "festive colors"}
- Design should match a ${character || "elegant"} theme
- Print-ready format: 11x8.5 inches per letter/section, 300 DPI
- Letters should be bold and visible from distance
- Include decorative elements between letters
- Professional quality for home printing and stringing together
Style: Bold, festive, celebration-themed, easy to cut out`
      },
      {
        type: "cake_topper",
        prompt: `Create a printable cake topper design with these specifications:
- Text: "${name}" and small "${occasion}" text
- Theme: ${theme || character || "celebration"}
- Colors: ${colors || "festive colors"}
- Character theme: ${character || "elegant celebration"}
- Print-ready format: 8.5x11 inches, 300 DPI
- Include clear cut lines and fold lines
- Design should fit on a standard toothpick or skewer
- Include assembly instructions visually
- Double-sided design (front and back identical)
- Professional quality with 0.125" border for cutting
Style: Whimsical, celebratory, perfect for cake decoration`
      },
      {
        type: "place_cards",
        prompt: `Create elegant place card templates with these specifications:
- Occasion: ${occasion}
- Theme: ${theme || character || "celebration"}
- Colors: ${colors || "festive colors"}
- Design should match a ${character || "elegant"} theme
- Print-ready format: 2x3.5 inches folded, 300 DPI
- Include 6 place cards per sheet (8.5x11)
- Space for writing guest names
- Include fold line and cut lines
- Professional tent-card design
Style: Elegant, sophisticated, matching party theme`
      }
    ];

    const generateImage = async (itemPrompt: string) => {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
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
        console.error(`AI generation failed: ${response.status} - ${errorText}`);
        throw new Error(`Failed to generate image: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!imageUrl) {
        throw new Error("No image returned from AI");
      }

      return imageUrl;
    };

    // Generate all items in parallel
    console.log("Starting parallel generation of all 5 party items...");
    const generatedImages = await Promise.all(
      items.map(item => generateImage(item.prompt))
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