import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        tools: [{
          type: "function",
          function: {
            name: "invite_copy",
            description: "Return invitation headline and message.",
            parameters: {
              type: "object",
              properties: {
                headline: { type: "string", description: "Short, evocative headline, max ~8 words." },
                message: { type: "string", description: "Warm 2-3 sentence personal note." },
              },
              required: ["headline", "message"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "invite_copy" } },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      throw new Error("AI gateway error");
    }
    const data = await aiResp.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments ? JSON.parse(call.function.arguments) : null;
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
