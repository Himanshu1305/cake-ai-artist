import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { IMAGE_MODEL_HQ } from "../_shared/ai-models.ts";
import { generateImage } from "../_shared/gemini-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure prompt explicitly asks for image generation
    const imagePrompt = prompt.startsWith("Generate") ? prompt : `Generate an image: ${prompt}`;
    console.log("Generating logo with prompt:", imagePrompt.substring(0, 100) + "...");

    let imageUrl: string;
    try {
      const base64 = await generateImage({ model: IMAGE_MODEL_HQ, prompt: imagePrompt });
      imageUrl = `data:image/png;base64,${base64}`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Gemini image error:", msg);
      if (msg.includes("RATE_LIMIT")) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Image generation failed: ${msg}`);
    }

    console.log("Logo generated successfully");

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Logo generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate logo" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
