import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const formatDate = (iso?: string | null, tz?: string | null) => {
  if (!iso) return "TBD";
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
      timeZone: tz || undefined, timeZoneName: "short",
    });
  } catch { return new Date(iso).toLocaleString(); }
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
    const userId = claims.claims.sub;
    const { taskId, variation } = await req.json();
    if (!taskId) throw new Error("taskId required");

    const { data: task } = await supabase.from("party_tasks").select("*").eq("id", taskId).maybeSingle();
    if (!task) throw new Error("Task not found");

    const { data: party } = await supabase
      .from("parties").select("*").eq("id", task.party_id).eq("user_id", userId).maybeSingle();
    if (!party) throw new Error("Party not found or not yours");

    const { data: profile } = await supabase
      .from("profiles").select("first_name").eq("id", userId).maybeSingle();
    const hostName = profile?.first_name || (party.contact_email || "the host").split("@")[0];

    const dateLine = formatDate(party.event_date, party.event_timezone);
    const venue = [party.venue, party.city].filter(Boolean).join(", ") || "TBD";
    const guests = party.guest_count || "TBD";
    const theme = party.theme || "Not yet decided";

    const styleHint = ["warm and friendly", "concise and professional", "enthusiastic and excited"][(variation || 0) % 3];

    const userPrompt = `Write a short message I can send to a vendor to request a quote and availability for an upcoming party.

Tone: ${styleHint}. 5-9 short lines, plain text, no markdown.
Start with a greeting that uses the vendor's name if provided.
End with my name and contact details.

VENDOR
Name: ${task.vendor_name || "(unknown)"}
Service needed: ${task.title}
Category: ${task.category || "general"}
Specifics: ${task.description || task.vendor_notes || "(none)"}

EVENT
Title: ${party.title}
Occasion: ${party.occasion || "celebration"}
Theme: ${theme}
When: ${dateLine}
Where: ${venue}
Guests: ${guests}

HOST
Name: ${hostName}
Phone: ${party.contact_phone || "(not provided)"}
Email: ${party.contact_email || "(not provided)"}

Ask politely for: availability on the date, a price quote, and what's included. Mention the theme so they can suggest themed options. Do NOT include a "Subject:" line, do NOT add disclaimers or "here is your message" preamble — return only the message body itself.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You write short, warm, copy-paste-ready messages for party hosts to send to vendors. Output only the message body, no extra commentary." },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Too many requests, slow down a bit." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      throw new Error("AI gateway error");
    }
    const aiData = await aiResp.json();
    const raw = (aiData.choices?.[0]?.message?.content || "").trim();
    // Strip any leading "Subject: ..." line the model may have added despite instructions.
    const message = raw.replace(/^\s*subject\s*:.*$/im, "").replace(/^\s*\n+/, "").trim();
    if (!message) throw new Error("No message generated");

    await supabase.from("party_tasks").update({ vendor_message: message }).eq("id", taskId);

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
