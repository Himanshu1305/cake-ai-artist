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

const formatShortDate = (iso?: string | null, tz?: string | null) => {
  if (!iso) return "soon";
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short", month: "short", day: "numeric",
      timeZone: tz || undefined,
    });
  } catch { return new Date(iso).toLocaleDateString(); }
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
    const { taskId, customMessage } = await req.json();
    if (!taskId) throw new Error("taskId required");

    const { data: task } = await supabase.from("party_tasks").select("*").eq("id", taskId).maybeSingle();
    if (!task) throw new Error("Task not found");
    if (!task.vendor_email) throw new Error("Vendor email missing");

    const { data: party } = await supabase
      .from("parties").select("*").eq("id", task.party_id).eq("user_id", userId).maybeSingle();
    if (!party) throw new Error("Party not found or not yours");

    const dateLine = formatDate(party.event_date, party.event_timezone);
    const hostName = (party.contact_email || "the host").split("@")[0];
    const venue = [party.venue, party.city].filter(Boolean).join(", ") || "TBD";
    const guests = party.guest_count || "TBD";
    const theme = party.theme || "Not yet decided";

    const greeting = task.vendor_name ? `Hi ${task.vendor_name},` : "Hello,";
    const body = customMessage?.trim() || `${greeting}

I'm planning a ${party.occasion || "celebration"} (${party.title}) and would love your help with: ${task.title}.

Event details:
• When: ${dateLine}
• Where: ${venue}
• Guests: ${guests}
• Theme: ${theme}
${task.description ? `\nWhat I'm looking for:\n${task.description}\n` : ""}
Could you share availability and a quote?

Thanks!
${party.contact_phone ? `📱 ${party.contact_phone}` : ""}
${party.contact_email ? `✉️ ${party.contact_email}` : ""}`;

    const html = `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#222;max-width:560px;margin:0 auto;padding:24px;">
<div style="white-space:pre-wrap;line-height:1.6;font-size:15px;">${body.replace(/</g, "&lt;")}</div>
<hr style="margin:28px 0 16px;border:none;border-top:1px solid #eee;"/>
<p style="font-size:12px;color:#888;">Sent via <a href="https://cakeaiartist.com" style="color:#2563EB;">Cake AI Artist Party Planner</a></p>
</body></html>`;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("Email service not configured");

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Cake AI Artist <noreply@cakeaiartist.com>",
        to: [task.vendor_email],
        reply_to: party.contact_email || undefined,
        subject: `${party.title} — ${task.title} (request for quote)`,
        html,
        text: body,
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("Resend error", resp.status, t);
      throw new Error("Failed to send email");
    }

    await supabase.from("party_tasks").update({
      vendor_contacted_at: new Date().toISOString(),
      vendor_status: task.vendor_status === "confirmed" ? "confirmed" : "contacted",
    }).eq("id", taskId);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
