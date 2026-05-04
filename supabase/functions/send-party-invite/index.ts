import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const formatEventDate = (iso: string, tz?: string | null) => {
  try {
    return new Date(iso).toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: tz || undefined,
      timeZoneName: "short",
    });
  } catch {
    return new Date(iso).toLocaleString();
  }
};

const THEME_STYLES: Record<string, { gradient: string; emoji: string; heroEmojis?: string; badge?: string; font?: string; artwork?: string }> = {
  "Space / Astronaut": { gradient: "linear-gradient(135deg,#0b1437 0%,#3b1d6b 60%,#7a2dcf 100%)", emoji: "🚀", heroEmojis: "🚀 🪐 👨‍🚀 🌕 ✨", badge: "Mission control says: party launch approved", font: "Orbitron, Georgia, serif" },
  "Iron Man / Avengers": { gradient: "linear-gradient(135deg,#7a0e0e 0%,#c11d1d 50%,#f5b400 100%)", emoji: "⚡", heroEmojis: "🦾 🛡️ ⚡ 🔥 💥", badge: "Suit up — the birthday squad is assembling", font: "Impact, Georgia, serif", artwork: "https://cakeaiartist.com/invite-superhero-armor-action.jpg" },
  "Spider-Man": { gradient: "linear-gradient(135deg,#b00020 0%,#1a47b8 100%)", emoji: "🕸️" },
  "Star Wars": { gradient: "linear-gradient(135deg,#000 0%,#1a1a2e 60%,#ffe81f 100%)", emoji: "✨" },
  "Frozen / Elsa": { gradient: "linear-gradient(135deg,#a8e6ff 0%,#5fb8e6 60%,#7c3aed 100%)", emoji: "❄️" },
  "Barbie Pink": { gradient: "linear-gradient(135deg,#ff4fa3 0%,#ff77c6 50%,#ffb3d9 100%)", emoji: "💖" },
  "Harry Potter": { gradient: "linear-gradient(135deg,#1a1a2e 0%,#5a189a 60%,#a47148 100%)", emoji: "⚡" },
  "Peppa Pig": { gradient: "linear-gradient(135deg,#ff8fb1 0%,#ffc1d6 100%)", emoji: "🐷" },
  "Paw Patrol": { gradient: "linear-gradient(135deg,#0e7490 0%,#dc2626 100%)", emoji: "🐾" },
  "Dinosaur / Jurassic": { gradient: "linear-gradient(135deg,#365314 0%,#65a30d 60%,#fbbf24 100%)", emoji: "🦖" },
  "Mermaid / Under the Sea": { gradient: "linear-gradient(135deg,#0891b2 0%,#22d3ee 60%,#a78bfa 100%)", emoji: "🧜‍♀️" },
  "Construction / Trucks": { gradient: "linear-gradient(135deg,#facc15 0%,#f59e0b 60%,#1f2937 100%)", emoji: "🚧" },
  "Jungle Safari": { gradient: "linear-gradient(135deg,#3f6212 0%,#a16207 100%)", emoji: "🦁" },
  Pokemon: { gradient: "linear-gradient(135deg,#dc2626 0%,#fbbf24 100%)", emoji: "⚡" },
  Minecraft: { gradient: "linear-gradient(135deg,#365314 0%,#16a34a 60%,#78350f 100%)", emoji: "⛏️" },
  "Princess / Royal": { gradient: "linear-gradient(135deg,#f9a8d4 0%,#a78bfa 60%,#fbbf24 100%)", emoji: "👑" },
  "Wonder Woman": { gradient: "linear-gradient(135deg,#991b1b 0%,#1e3a8a 60%,#fbbf24 100%)", emoji: "⭐" },
  "Hot Wheels": { gradient: "linear-gradient(135deg,#dc2626 0%,#1f2937 100%)", emoji: "🏎️" },
  Bluey: { gradient: "linear-gradient(135deg,#1976d2 0%,#42a5f5 100%)", emoji: "🐶" },
  "Taylor Swift Eras": { gradient: "linear-gradient(135deg,#7b2cbf 0%,#c77dff 50%,#ffd700 100%)", emoji: "🎤" },
  Cocomelon: { gradient: "linear-gradient(135deg,#79c142 0%,#fdd835 100%)", emoji: "🍉" },
  "Unicorn & Rainbow": { gradient: "linear-gradient(135deg,#ff9a9e 0%,#fad0c4 30%,#a18cd1 70%,#fbc2eb 100%)", emoji: "🦄" },
  "Tropical Luau": { gradient: "linear-gradient(135deg,#06b6d4 0%,#10b981 60%,#facc15 100%)", emoji: "🌺" },
  "Black & Gold Elegance": { gradient: "linear-gradient(135deg,#000 0%,#1a1a1a 60%,#d4af37 100%)", emoji: "✨" },
  "Carnival / Circus": { gradient: "linear-gradient(135deg,#ef4444 0%,#fbbf24 50%,#3b82f6 100%)", emoji: "🎪" },
};
const DEFAULT_STYLE = { gradient: "linear-gradient(135deg,#ff6b9d 0%,#c44569 50%,#8e44ad 100%)", emoji: "🎉", heroEmojis: "🎂 🎈 ✨ 🎁 🥳", badge: "A celebration made sweeter", font: "Georgia, serif" };

const getThemeStyle = (theme?: string | null) => {
  if (!theme) return DEFAULT_STYLE;
  const direct = THEME_STYLES[theme];
  if (direct) return direct;
  const normalized = theme.toLowerCase();
  if (normalized.includes("iron") || normalized.includes("avenger") || normalized.includes("superhero")) return THEME_STYLES["Iron Man / Avengers"];
  if (normalized.includes("space") || normalized.includes("astronaut") || normalized.includes("galaxy")) return THEME_STYLES["Space / Astronaut"];
  if (normalized.includes("iskcon") || normalized.includes("spiritual") || normalized.includes("krishna")) return THEME_STYLES["Spiritual / ISKCON"];
  return DEFAULT_STYLE;
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const inviteEmail = (host: string, party: any, guestName: string, rsvpUrl: string) => {
  const logoUrl = "https://cakeaiartist.com/logo.png";
  const dateLine = party.event_date ? formatEventDate(party.event_date, party.event_timezone) : "";
  const t = getThemeStyle(party.theme);
  const headline = escapeHtml((party.invite_headline || "").trim() || `You're invited to ${party.title}!`);
  const note = escapeHtml((party.invite_message || "").trim() ||
    `${host} would love for you to join the celebration. Expect smiles, cake, surprises, and a party table full of little wow moments.`).replace(/\n/g, "<br>");
  const safeHost = escapeHtml(host);
  const safeGuestName = escapeHtml(guestName);
  const heroBackground = t.artwork
    ? `linear-gradient(rgba(0,0,0,.18), rgba(0,0,0,.48)), url('${t.artwork}') center/cover no-repeat`
    : t.gradient;
  return `
<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fdf6f0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;padding-bottom:20px;">
      <img src="${logoUrl}" alt="Cake AI Artist" style="height:44px;display:inline-block;" />
    </div>

    <div style="background:${heroBackground};border-radius:24px 24px 0 0;padding:150px 32px 34px;text-align:center;color:#fff;">
      <div style="font-size:30px;line-height:1;letter-spacing:5px;">${t.heroEmojis || t.emoji}</div>
      ${t.badge ? `<div style="display:inline-block;margin:16px auto 0;padding:7px 14px;border-radius:999px;background:rgba(0,0,0,.42);border:1px solid rgba(255,255,255,.35);font-size:11px;font-weight:800;text-transform:uppercase;">${escapeHtml(t.badge)}</div>` : ""}
      <h1 style="margin:16px 0 8px;font-size:34px;line-height:1.03;font-family:${t.font || "Georgia,serif"};font-weight:800;text-shadow:0 3px 16px rgba(0,0,0,.45);">${headline}</h1>
      ${party.occasion ? `<p style="margin:6px 0 0;font-size:14px;opacity:.92;text-transform:capitalize;">${escapeHtml(party.occasion)}</p>` : ""}
    </div>

    <div style="background:#fff;padding:36px 32px;border-radius:0 0 24px 24px;box-shadow:0 12px 40px rgba(0,0,0,.08);">
      <p style="font-size:17px;color:#333;margin:0 0 8px;font-weight:700;">Hi ${safeGuestName},</p>
      <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;white-space:pre-wrap;">${note}</p>

      <div style="background:#fdf6f0;border-radius:14px;padding:20px;margin:0 0 24px;">
        ${dateLine ? `<p style="margin:0 0 10px;font-size:15px;color:#333;"><strong>📅 When:</strong> ${escapeHtml(dateLine)}</p>` : ""}
        ${party.venue ? `<p style="margin:0 0 10px;font-size:15px;color:#333;"><strong>📍 Where:</strong> ${escapeHtml(party.venue)}${party.city ? ", " + escapeHtml(party.city) : ""}</p>` : ""}
        ${party.theme ? `<p style="margin:0;font-size:15px;color:#333;"><strong>✨ Theme:</strong> ${escapeHtml(party.theme)}</p>` : ""}
      </div>

      <div style="text-align:center;margin:28px 0;">
        <a href="${rsvpUrl}" style="display:inline-block;background:${t.gradient};color:#fff;text-decoration:none;padding:16px 44px;border-radius:30px;font-weight:bold;font-size:16px;box-shadow:0 8px 20px rgba(0,0,0,.18);">RSVP Now →</a>
        <p style="margin:12px 0 0;font-size:12px;color:#999;">Tap to let ${safeHost} know if you can make it.</p>
      </div>

      <div style="border-top:1px solid #f0e4d7;padding-top:24px;margin-top:24px;">
        <p style="text-align:center;margin:0 0 12px;"><img src="${logoUrl}" alt="Cake AI Artist" style="height:34px;display:inline-block;" /></p>
        <p style="font-size:13px;color:#777;line-height:1.6;margin:0 0 14px;text-align:center;">
          ✨ This celebration was styled with <strong>Cake AI Artist</strong> — design your own AI cake, invite, and party look in minutes.
        </p>
        <p style="font-size:12px;color:#aaa;margin:8px 0 0;text-align:center;">
          <a href="https://cakeaiartist.com/?utm_source=party_invite&utm_medium=email&utm_campaign=invite_footer" style="display:inline-block;color:#c44569;text-decoration:none;font-weight:700;margin:0 10px;">Design your own cake →</a>
          <a href="https://cakeaiartist.com/party-planner?utm_source=party_invite&utm_medium=email&utm_campaign=invite_footer" style="display:inline-block;color:#c44569;text-decoration:none;font-weight:700;margin:0 10px;">Plan a party free →</a>
        </p>
      </div>
    </div>

    <p style="text-align:center;font-size:11px;color:#bbb;margin:20px 0 0;">Powered by Cake AI Artist · cakeaiartist.com</p>
  </div>
</body></html>`;
};

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
