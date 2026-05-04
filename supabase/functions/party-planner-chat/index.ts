import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the Cake AI Artist Party Concierge — a warm, witty, conversational party planner.

Be playful but concise (2-3 sentences max per turn).

CRITICAL RULES:
- The user fills event details (date, time, venue, guest count, theme, contact) via a form, passed in "Current party context".
- If date, guest_count, and theme/occasion are ALREADY known, DO NOT re-ask. Call \`build_party_plan\` IMMEDIATELY.
- If the user says "build the plan now" or "generate plan", call \`build_party_plan\` immediately using whatever info you have.
- Only ask ONE question at a time, and only if a truly critical field is missing.

When calling \`build_party_plan\`, return 9-12 PRACTICAL, vendor-driven tasks. Every task needs \`days_before\` relative to the event date.

MANDATORY baseline tasks (skip only if clearly not needed):
1. Cake — vendor: Local baker / Cake AI Artist designer
2. Decoration & balloons — vendor: Decorator
3. Catering / Food — vendor: Caterer or restaurant
4. Photographer / Videographer — vendor: Event photographer
5. Entertainment (host, magician, DJ, games, face-painter) — vendor: depends on age
6. Invitations & RSVPs — handled in-app
7. Return gifts / party favors — vendor: Gift shop or online
8. Venue booking & logistics (chairs, tables, parking) — vendor: Venue or rental company
9. Day-of coordinator / helper — vendor: Friend or event coordinator

DO NOT add fluffy filler like "make a playlist", "buy thank-you cards", "rest the night before", "take photos with guests".

For EVERY task, the \`description\` field MUST start with "Vendor: <type>" so users know who to contact (e.g. "Vendor: Local baker. Order a 2kg theme cake matching the party theme."). Use category from: invitations, food, decor, activities, logistics, day-of, photography, entertainment, gifts.

If asked to draft a vendor message, write a copy-pasteable message with: greeting, event date/time, venue, guest count, theme, what's needed, host contact info.

Never invent a plan in plain text — always use the tool. After calling, give a short celebratory wrap-up.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { partyId, userMessage } = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      console.error("Auth failed", claimsError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    // Verify ownership and load party
    const { data: party } = await supabase
      .from("parties")
      .select("*")
      .eq("id", partyId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!party) throw new Error("Party not found");

    // Load existing chat history
    const { data: history } = await supabase
      .from("party_chat_messages")
      .select("role, content")
      .eq("party_id", partyId)
      .order("created_at", { ascending: true });

    // Persist user message
    await supabase.from("party_chat_messages").insert({
      party_id: partyId,
      role: "user",
      content: userMessage,
    });

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + `\n\nCurrent party context: ${JSON.stringify({ title: party.title, occasion: party.occasion, event_date: party.event_date, event_timezone: party.event_timezone, guest_count: party.guest_count, venue: party.venue, city: party.city, theme: party.theme, contact_email: party.contact_email, contact_phone: party.contact_phone })}` },
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ];

    const tools = [{
      type: "function",
      function: {
        name: "build_party_plan",
        description: "Generate the smart checklist of tasks for the party",
        parameters: {
          type: "object",
          properties: {
            occasion: { type: "string" },
            event_date: { type: "string", description: "ISO date" },
            guest_count: { type: "number" },
            venue: { type: "string" },
            theme: { type: "string" },
            budget: { type: "number" },
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string", enum: ["invitations", "food", "decor", "activities", "logistics", "day-of"] },
                  days_before: { type: "number", description: "Days before event_date" },
                },
                required: ["title", "category", "days_before"],
              },
            },
          },
          required: ["tasks"],
        },
      },
    }];

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools,
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Too many requests, slow down a bit." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResp.json();
    const choice = aiData.choices?.[0]?.message;
    let assistantText = choice?.content || "";
    let planBuilt = false;

    const toolCall = choice?.tool_calls?.[0];
    if (toolCall?.function?.name === "build_party_plan") {
      const args = JSON.parse(toolCall.function.arguments);
      planBuilt = true;

      // Update party
      const partyUpdate: any = {};
      if (args.occasion) partyUpdate.occasion = args.occasion;
      if (args.event_date) partyUpdate.event_date = args.event_date;
      if (args.guest_count) partyUpdate.guest_count = args.guest_count;
      if (args.venue) partyUpdate.venue = args.venue;
      if (args.theme) partyUpdate.theme = args.theme;
      if (args.budget) partyUpdate.budget = args.budget;
      if (Object.keys(partyUpdate).length) {
        await supabase.from("parties").update(partyUpdate).eq("id", partyId);
      }

      // Replace tasks
      await supabase.from("party_tasks").delete().eq("party_id", partyId);
      const eventDate = args.event_date ? new Date(args.event_date) : (party.event_date ? new Date(party.event_date) : new Date(Date.now() + 14 * 86400000));
      const tasksToInsert = (args.tasks || []).map((t: any, i: number) => {
        const due = new Date(eventDate);
        due.setDate(due.getDate() - (t.days_before || 0));
        return {
          party_id: partyId,
          title: t.title,
          description: t.description || null,
          category: t.category,
          due_date: due.toISOString().slice(0, 10),
          sort_order: i,
        };
      });
      if (tasksToInsert.length) await supabase.from("party_tasks").insert(tasksToInsert);

      if (!assistantText) {
        assistantText = `🎉 All set! I've built your party plan with ${tasksToInsert.length} tasks. You'll see the checklist update right away — tackle them at your own pace!`;
      }
    }

    // Persist assistant message
    if (assistantText) {
      await supabase.from("party_chat_messages").insert({
        party_id: partyId,
        role: "assistant",
        content: assistantText,
      });
    }

    return new Response(JSON.stringify({ message: assistantText, planBuilt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
