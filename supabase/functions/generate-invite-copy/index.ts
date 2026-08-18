import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { CHAT_MODEL_DEFAULT } from "../_shared/ai-models.ts";
import { generateWithTools } from "../_shared/gemini-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { theme, occasion, title, hostName, eventDate, avoid } = await req.json();

    const sys = `You write short, warm, on-brand party invitation copy. You produce ONE headline (max 8 words) and ONE personal note (2-3 sentences, ~30-55 words, plain text, no markdown, no excessive emojis — at most one tasteful emoji).

CRITICAL TONE RULES:
- The OCCASION dictates the tone, NOT the theme. If the occasion is "anniversary", "wedding", "engagement", "baby shower", "housewarming", or "retirement", the copy must be warm, sincere, and grown-up — never childish, never about "lions, tigers, dinos, pups, glitter, scrunchies, vroom vroom" etc., even when the theme is playful.
- For adult/romantic occasions, reinterpret playful theme motifs tastefully (e.g. for a "Jungle Safari" anniversary: speak of "a beautiful wild ride together", "an adventure of years", NOT lions and tigers).
- For kids' birthdays, embrace the playful theme energy fully.
- Never mention cake brands, never mention apps. Just the celebration.
- Avoid generic "Come celebrate, laugh, and make sweet memories" filler. Be specific and felt.`;

    const user = `Write invite copy.
Occasion: ${occasion || "celebration"}
Theme: ${theme || "(no specific theme)"}
Event title: ${title || "our celebration"}
Host: ${hostName || "the host"}
When: ${eventDate || "TBD"}

${avoid && avoid.length ? `Do NOT reuse or paraphrase these previous headlines: ${avoid.map((s: string) => `"${s}"`).join(", ")}. Produce something distinctly different.` : ""}`;

    let args: { headline?: string; message?: string } | null;
    try {
      const result = await generateWithTools({
        model: CHAT_MODEL_DEFAULT,
        systemPrompt: sys,
        messages: [{ role: "user", content: user }],
        tools: [{
          name: "invite_copy",
          description: "Return invitation headline and message.",
          parameters: {
            type: "object",
            properties: {
              headline: { type: "string", description: "Short, evocative headline, max ~8 words." },
              message: { type: "string", description: "Warm 2-3 sentence personal note." },
            },
            required: ["headline", "message"],
          },
        }],
        toolConfig: { mode: "ANY", allowedFunctionNames: ["invite_copy"] },
      });
      args = (result.toolCall?.args as { headline?: string; message?: string } | undefined) ?? null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("AI error", msg);
      if (msg.includes("RATE_LIMIT")) {
        return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("AI gateway error");
    }
    if (!args?.headline || !args?.message) throw new Error("No copy generated");

    return new Response(JSON.stringify({ headline: args.headline, message: args.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
