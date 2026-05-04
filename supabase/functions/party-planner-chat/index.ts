import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the Cake AI Artist Party Concierge — a warm, witty, conversational party planner.

Your job is to help the user plan a celebration step-by-step. Ask ONE question at a time, naturally. Be playful but concise (2-3 sentences max per turn).

Goal: collect enough info to build their party plan, then call \`build_party_plan\` to generate a smart checklist.

Information to gather (don't list — ask conversationally):
- Occasion (birthday, anniversary, baby shower, etc.)
- Date / how many days away
- Guest count and vibe (kids, adults, mixed)
- Venue (home, outdoors, hall)
- Theme or vibe (if any)
- Budget range (optional)

Once you have enough (occasion + date + guest count minimum), call \`build_party_plan\` with a checklist of 8-15 actionable tasks with due dates relative to the event date. Categories: invitations, food, decor, activities, logistics, day-of.

Never invent a plan in plain text — always use the tool. After calling the tool, give a short celebratory wrap-up message.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { partyId, userMessage } = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData } = await userClient.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error("Unauthorized");

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
      { role: "system", content: SYSTEM_PROMPT + `\n\nCurrent party context: ${JSON.stringify({ title: party.title, occasion: party.occasion, event_date: party.event_date, guest_count: party.guest_count, venue: party.venue, theme: party.theme })}` },
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
