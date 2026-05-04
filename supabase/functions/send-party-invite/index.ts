import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const inviteEmail = (host: string, party: any, guestName: string, rsvpUrl: string) => `
<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:Segoe UI,sans-serif;background:#fef7f7;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#ff6b9d,#c44569);border-radius:20px 20px 0 0;padding:40px;text-align:center;color:#fff;">
      <h1 style="margin:0;font-size:30px;">🎉 You're Invited!</h1>
      <p style="margin:8px 0 0;font-size:16px;opacity:.95;">${party.occasion || "A celebration"}</p>
    </div>
    <div style="background:#fff;padding:40px;border-radius:0 0 20px 20px;box-shadow:0 10px 40px rgba(0,0,0,.1);">
      <p style="font-size:18px;color:#333;">Hi ${guestName},</p>
      <p style="font-size:16px;color:#555;line-height:1.6;">${host} is hosting <strong>${party.title}</strong> and would love for you to be there.</p>
      ${party.event_date ? `<p style="font-size:16px;color:#555;"><strong>📅 When:</strong> ${new Date(party.event_date).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}</p>` : ""}
      ${party.venue ? `<p style="font-size:16px;color:#555;"><strong>📍 Where:</strong> ${party.venue}</p>` : ""}
      ${party.theme ? `<p style="font-size:16px;color:#555;"><strong>✨ Theme:</strong> ${party.theme}</p>` : ""}
      <div style="text-align:center;margin:32px 0;">
        <a href="${rsvpUrl}" style="display:inline-block;background:linear-gradient(135deg,#ff6b9d,#c44569);color:#fff;text-decoration:none;padding:16px 40px;border-radius:30px;font-weight:bold;">RSVP Now</a>
      </div>
      <p style="font-size:13px;color:#999;text-align:center;">Powered by Cake AI Artist</p>
    </div>
  </div>
</body></html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { partyId, guestIds } = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { data: party } = await supabase.from("parties").select("*").eq("id", partyId).eq("user_id", userId).maybeSingle();
    if (!party) throw new Error("Party not found");

    const { data: profile } = await supabase.from("profiles").select("first_name, email").eq("id", userId).maybeSingle();
    const hostName = profile?.first_name || "Your friend";

    const guestQuery = supabase.from("party_guests").select("*").eq("party_id", partyId);
    const { data: guests } = guestIds?.length
      ? await guestQuery.in("id", guestIds)
      : await guestQuery.is("invited_at", null);

    const origin = req.headers.get("origin") || "https://cakeaiartist.com";
    const results: any[] = [];
    for (const g of guests || []) {
      if (!g.email) continue;
      const rsvpUrl = `${origin}/rsvp/${g.rsvp_token}`;
      try {
        await resend.emails.send({
          from: "Cake AI Artist <invites@cakeaiartist.com>",
          to: [g.email],
          subject: `🎉 You're invited to ${party.title}`,
          html: inviteEmail(hostName, party, g.name, rsvpUrl),
        });
        await supabase.from("party_guests").update({ invited_at: new Date().toISOString() }).eq("id", g.id);
        results.push({ id: g.id, ok: true });
      } catch (err) {
        console.error("send failed for", g.email, err);
        results.push({ id: g.id, ok: false });
      }
    }

    return new Response(JSON.stringify({ sent: results.filter((r) => r.ok).length, results }), {
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
