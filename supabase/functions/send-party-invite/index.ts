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

type ThemeStyle = {
  gradient: string;
  accent: string;
  emoji: string;
  heroEmojis?: string;
  badge?: string;
  font?: string;
  textColor?: string;
  bodyTint?: string;
  cornerEmojis?: [string, string];
  artwork?: string;
  pattern?: string;
};

const SPARKLE = "radial-gradient(circle at 18% 24%, rgba(255,255,255,.45) 0 4px, transparent 5px), radial-gradient(circle at 82% 18%, rgba(255,255,255,.32) 0 6px, transparent 7px), radial-gradient(circle at 70% 80%, rgba(255,255,255,.28) 0 4px, transparent 5px)";
const DOTS = "radial-gradient(circle at 18% 24%, rgba(255,255,255,.32) 0 8px, transparent 9px), radial-gradient(circle at 82% 18%, rgba(255,255,255,.22) 0 12px, transparent 13px)";
const STRIPES = "repeating-linear-gradient(135deg, rgba(255,255,255,.14) 0 12px, transparent 12px 26px)";
const STARS = "radial-gradient(circle at 22% 28%, rgba(255,255,255,.7) 0 2px, transparent 3px), radial-gradient(circle at 60% 18%, rgba(255,255,255,.55) 0 2px, transparent 3px), radial-gradient(circle at 78% 70%, rgba(255,255,255,.5) 0 2px, transparent 3px)";

const THEME_STYLES: Record<string, ThemeStyle> = {
  "Space / Astronaut": { gradient: "linear-gradient(135deg,#0b1437 0%,#3b1d6b 60%,#7a2dcf 100%)", accent: "#9ad0ff", emoji: "🚀", heroEmojis: "🚀 🪐 👨‍🚀 🌕 ✨", badge: "Mission control says: party launch approved", font: "Orbitron, Georgia, serif", textColor: "#e9f1ff", bodyTint: "#f0f3ff", cornerEmojis: ["🪐", "🌕"], pattern: STARS },
  "Iron Man / Avengers": { gradient: "linear-gradient(135deg,#7a0e0e 0%,#c11d1d 50%,#f5b400 100%)", accent: "#ffd166", emoji: "⚡", heroEmojis: "🦾 🛡️ ⚡ 🔥 💥", badge: "Suit up — the birthday squad is assembling", font: "Bangers, Impact, Georgia, serif", textColor: "#fff", bodyTint: "#fff7e6", cornerEmojis: ["🛡️", "⚡"], artwork: "https://cakeaiartist.com/invite-superhero-armor-action.jpg", pattern: STRIPES },
  "Spider-Man": { gradient: "linear-gradient(135deg,#b00020 0%,#1a47b8 100%)", accent: "#ffd700", emoji: "🕸️", heroEmojis: "🕷️ 🕸️ 🦸 💥 ✨", badge: "Your friendly neighborhood party invite", font: "Bangers, Impact, Georgia, serif", textColor: "#fff", bodyTint: "#fff5f5", cornerEmojis: ["🕸️", "🕷️"], pattern: STRIPES },
  "Star Wars": { gradient: "linear-gradient(135deg,#000 0%,#1a1a2e 60%,#ffe81f 100%)", accent: "#ffe81f", emoji: "✨", heroEmojis: "⚔️ 🌌 🛸 ✨ 🪐", badge: "May the party be with you", font: "Orbitron, Georgia, serif", textColor: "#fff", bodyTint: "#fffbe6", cornerEmojis: ["⚔️", "🌌"], pattern: STARS },
  "Frozen / Elsa": { gradient: "linear-gradient(135deg,#a8e6ff 0%,#5fb8e6 60%,#7c3aed 100%)", accent: "#5fb8e6", emoji: "❄️", heroEmojis: "❄️ 👑 ✨ 🏰 ⛄", badge: "Let it go and join the party", font: "'Brush Script MT', cursive", textColor: "#0b2545", bodyTint: "#f0faff", cornerEmojis: ["❄️", "✨"], pattern: SPARKLE },
  "Barbie Pink": { gradient: "linear-gradient(135deg,#ff4fa3 0%,#ff77c6 50%,#ffb3d9 100%)", accent: "#ff4fa3", emoji: "💖", heroEmojis: "💖 👛 👠 ✨ 🎀", badge: "Hi Barbie! Hi party!", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fff0f7", cornerEmojis: ["🎀", "💖"], pattern: SPARKLE },
  "Harry Potter": { gradient: "linear-gradient(135deg,#1a1a2e 0%,#5a189a 60%,#a47148 100%)", accent: "#d4af37", emoji: "⚡", heroEmojis: "⚡ 🪄 🦉 📜 ✨", badge: "Your Hogwarts letter has arrived", font: "Georgia, serif", textColor: "#fff", bodyTint: "#f7f1e6", cornerEmojis: ["🪄", "🦉"], pattern: STARS },
  "Peppa Pig": { gradient: "linear-gradient(135deg,#ff8fb1 0%,#ffc1d6 100%)", accent: "#ff8fb1", emoji: "🐷", heroEmojis: "🐷 🌧️ 💕 🌈 ✨", badge: "Snorts of joy — let's party", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fff5f8", cornerEmojis: ["🐷", "💕"], pattern: DOTS },
  "Paw Patrol": { gradient: "linear-gradient(135deg,#0e7490 0%,#dc2626 100%)", accent: "#fde047", emoji: "🐾", heroEmojis: "🐾 🚒 🚓 🦴 ✨", badge: "No job is too big — no pup is too small", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fff8e1", cornerEmojis: ["🐾", "🚒"], pattern: DOTS },
  "Dinosaur / Jurassic": { gradient: "linear-gradient(135deg,#365314 0%,#65a30d 60%,#fbbf24 100%)", accent: "#65a30d", emoji: "🦖", heroEmojis: "🦖 🦕 🌿 🥚 ✨", badge: "A roaringly good celebration", font: "Georgia, serif", textColor: "#fff", bodyTint: "#f7fff0", cornerEmojis: ["🦖", "🌿"], pattern: STRIPES },
  "Mermaid / Under the Sea": { gradient: "linear-gradient(135deg,#0891b2 0%,#22d3ee 60%,#a78bfa 100%)", accent: "#22d3ee", emoji: "🧜‍♀️", heroEmojis: "🧜‍♀️ 🐚 🐠 🌊 ✨", badge: "Dive in — the party's making waves", font: "Georgia, serif", textColor: "#fff", bodyTint: "#f0fcff", cornerEmojis: ["🐚", "🌊"], pattern: SPARKLE },
  "Construction / Trucks": { gradient: "linear-gradient(135deg,#facc15 0%,#f59e0b 60%,#1f2937 100%)", accent: "#f59e0b", emoji: "🚧", heroEmojis: "🚧 🚜 🔧 🏗️ ✨", badge: "Hard hats on — celebration in progress", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fffaf0", cornerEmojis: ["🚧", "🚜"], pattern: STRIPES },
  "Jungle Safari": { gradient: "linear-gradient(135deg,#3f6212 0%,#a16207 100%)", accent: "#fde68a", emoji: "🦁", heroEmojis: "🦁 🐘 🦓 🌴 ✨", badge: "Time for a wild adventure", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fff8e6", cornerEmojis: ["🦁", "🌴"], pattern: STRIPES },
  Pokemon: { gradient: "linear-gradient(135deg,#dc2626 0%,#fbbf24 100%)", accent: "#dc2626", emoji: "⚡", heroEmojis: "⚡ 🎮 🔴 ✨ 🏆", badge: "Gotta party 'em all", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fff5e6", cornerEmojis: ["⚡", "🏆"], pattern: DOTS },
  Minecraft: { gradient: "linear-gradient(135deg,#365314 0%,#16a34a 60%,#78350f 100%)", accent: "#16a34a", emoji: "⛏️", heroEmojis: "⛏️ 🟫 🟩 💎 ✨", badge: "Build, mine, celebrate", font: "'Courier New', monospace", textColor: "#fff", bodyTint: "#f0fff0", cornerEmojis: ["⛏️", "💎"], pattern: STRIPES },
  "Princess / Royal": { gradient: "linear-gradient(135deg,#f9a8d4 0%,#a78bfa 60%,#fbbf24 100%)", accent: "#a78bfa", emoji: "👑", heroEmojis: "👑 🏰 ✨ 🌹 💎", badge: "A royal invitation just for you", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fdf4ff", cornerEmojis: ["👑", "🌹"], pattern: SPARKLE },
  "Wonder Woman": { gradient: "linear-gradient(135deg,#991b1b 0%,#1e3a8a 60%,#fbbf24 100%)", accent: "#fbbf24", emoji: "⭐", heroEmojis: "⭐ 🛡️ 💪 ✨ 👑", badge: "Calling all wonder women", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fff8e6", cornerEmojis: ["⭐", "🛡️"], pattern: STARS },
  "Hot Wheels": { gradient: "linear-gradient(135deg,#dc2626 0%,#1f2937 100%)", accent: "#fbbf24", emoji: "🏎️", heroEmojis: "🏎️ 🏁 🔥 ✨ 🛞", badge: "Start your engines — party time", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fff5f0", cornerEmojis: ["🏎️", "🏁"], pattern: STRIPES },
  Bluey: { gradient: "linear-gradient(135deg,#1976d2 0%,#42a5f5 100%)", accent: "#fff59d", emoji: "🐶", heroEmojis: "🐶 🦴 🎾 🏠 ✨", badge: "Wackadoo! It's party time", font: "Georgia, serif", textColor: "#fff", bodyTint: "#eef6ff", cornerEmojis: ["🐾", "🎾"], pattern: DOTS },
  "Taylor Swift Eras": { gradient: "linear-gradient(135deg,#7b2cbf 0%,#c77dff 50%,#ffd700 100%)", accent: "#ffd700", emoji: "🎤", heroEmojis: "🎤 ✨ 🪩 💜 🎸", badge: "It's me, hi — you're invited, it's me", font: "Georgia, serif", textColor: "#fff", bodyTint: "#faf0ff", cornerEmojis: ["✨", "🪩"], pattern: SPARKLE },
  Cocomelon: { gradient: "linear-gradient(135deg,#79c142 0%,#fdd835 100%)", accent: "#79c142", emoji: "🍉", heroEmojis: "🍉 🎵 👶 🌈 ✨", badge: "Sing, dance, and celebrate together", font: "Georgia, serif", textColor: "#fff", bodyTint: "#f5fff0", cornerEmojis: ["🎵", "🍉"], pattern: DOTS },
  "Unicorn & Rainbow": { gradient: "linear-gradient(135deg,#ff9a9e 0%,#fad0c4 30%,#a18cd1 70%,#fbc2eb 100%)", accent: "#a18cd1", emoji: "🦄", heroEmojis: "🦄 🌈 ✨ 🌟 🎀", badge: "A magical, sparkly celebration", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fff0fa", cornerEmojis: ["🦄", "🌈"], pattern: SPARKLE },
  "Tropical Luau": { gradient: "linear-gradient(135deg,#06b6d4 0%,#10b981 60%,#facc15 100%)", accent: "#facc15", emoji: "🌺", heroEmojis: "🌺 🍍 🌴 🥥 ✨", badge: "Aloha — let's party island style", font: "Georgia, serif", textColor: "#fff", bodyTint: "#f0fdf9", cornerEmojis: ["🌴", "🌺"], pattern: DOTS },
  "Black & Gold Elegance": { gradient: "linear-gradient(135deg,#000 0%,#1a1a1a 60%,#d4af37 100%)", accent: "#d4af37", emoji: "✨", heroEmojis: "✨ 🥂 🖤 🌟 🎩", badge: "An elegant evening, just for you", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fffaf0", cornerEmojis: ["✨", "🥂"], pattern: STARS },
  "Carnival / Circus": { gradient: "linear-gradient(135deg,#ef4444 0%,#fbbf24 50%,#3b82f6 100%)", accent: "#ef4444", emoji: "🎪", heroEmojis: "🎪 🎠 🎈 🤹 ✨", badge: "Step right up to the greatest party", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fff5f0", cornerEmojis: ["🎪", "🎠"], pattern: STRIPES },
  "Spiritual / ISKCON": { gradient: "linear-gradient(135deg,#ff9933 0%,#ffcc66 100%)", accent: "#7a2e0e", emoji: "🕉️", heroEmojis: "🪷 🕉️ 🪈 🌼 ✨", badge: "A soulful celebration with sweetness and blessings", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fff7e6", cornerEmojis: ["🪷", "🕉️"], pattern: DOTS },
  "Floral Garden": { gradient: "linear-gradient(135deg,#ffd1dc 0%,#ffafbd 60%,#a8e6cf 100%)", accent: "#7c9473", emoji: "🌸", heroEmojis: "🌸 🌷 🌿 🌼 ✨", badge: "A blooming celebration awaits", font: "Georgia, serif", textColor: "#3a3a3a", bodyTint: "#fff5f8", cornerEmojis: ["🌸", "🌿"], pattern: SPARKLE },
  "Boho Chic": { gradient: "linear-gradient(135deg,#d4a574 0%,#c08552 60%,#5e503f 100%)", accent: "#d4a574", emoji: "🌿", heroEmojis: "🌿 ✨ 🪶 🌾 🕯️", badge: "Earthy, warm, and beautifully you", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fbf3e8", cornerEmojis: ["🌿", "🪶"], pattern: STRIPES },
  "Disco / Y2K": { gradient: "linear-gradient(135deg,#ff00cc 0%,#3333ff 50%,#00ffea 100%)", accent: "#ff00cc", emoji: "🪩", heroEmojis: "🪩 💃 🕺 ✨ 🎶", badge: "Get ready to groove", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fff0fb", cornerEmojis: ["🪩", "✨"], pattern: SPARKLE },
  "Pastel Minimal": { gradient: "linear-gradient(135deg,#f7e8e3 0%,#e8d5e8 100%)", accent: "#a78bfa", emoji: "🌷", heroEmojis: "🌷 ✨ 🤍 🎀 🌸", badge: "Soft, simple, lovely", font: "Georgia, serif", textColor: "#3a3a3a", bodyTint: "#faf5ff", cornerEmojis: ["🌷", "✨"], pattern: SPARKLE },
  "Retro 90s": { gradient: "linear-gradient(135deg,#f72585 0%,#7209b7 50%,#3a0ca3 100%)", accent: "#f72585", emoji: "📼", heroEmojis: "📼 🕹️ 📀 ✨ 🎮", badge: "Totally rad — you're invited", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fff0f8", cornerEmojis: ["📼", "🕹️"], pattern: STRIPES },
  "Sports / Football": { gradient: "linear-gradient(135deg,#0b3d2e 0%,#1d8348 100%)", accent: "#fbbf24", emoji: "⚽", heroEmojis: "⚽ 🏆 🥅 🎽 ✨", badge: "Game on — be there or be square", font: "Georgia, serif", textColor: "#fff", bodyTint: "#f0fff5", cornerEmojis: ["⚽", "🏆"], pattern: STRIPES },
  "Garden Tea Party": { gradient: "linear-gradient(135deg,#fce7f3 0%,#bae6fd 60%,#bbf7d0 100%)", accent: "#7c2d12", emoji: "🫖", heroEmojis: "🫖 🌷 🍰 🌿 ✨", badge: "Tea, treats, and lovely company", font: "Georgia, serif", textColor: "#3a3a3a", bodyTint: "#fdf6f8", cornerEmojis: ["🫖", "🌷"], pattern: SPARKLE },
};
const DEFAULT_STYLE: ThemeStyle = { gradient: "linear-gradient(135deg,#ff6b9d 0%,#c44569 50%,#8e44ad 100%)", accent: "#c44569", emoji: "🎉", heroEmojis: "🎂 🎈 ✨ 🎁 🥳", badge: "A celebration made sweeter", font: "Georgia, serif", textColor: "#fff", bodyTint: "#fff5f8", cornerEmojis: ["🎈", "🎉"], pattern: DOTS };

const getThemeStyle = (theme?: string | null): ThemeStyle => {
  if (!theme) return DEFAULT_STYLE;
  const direct = THEME_STYLES[theme];
  if (direct) return direct;
  const n = theme.toLowerCase();
  if (n.includes("iron") || n.includes("avenger") || n.includes("superhero")) return THEME_STYLES["Iron Man / Avengers"];
  if (n.includes("space") || n.includes("astronaut") || n.includes("galaxy")) return THEME_STYLES["Space / Astronaut"];
  if (n.includes("iskcon") || n.includes("spiritual") || n.includes("krishna")) return THEME_STYLES["Spiritual / ISKCON"];
  if (n.includes("unicorn") || n.includes("rainbow")) return THEME_STYLES["Unicorn & Rainbow"];
  if (n.includes("barbie")) return THEME_STYLES["Barbie Pink"];
  if (n.includes("frozen") || n.includes("elsa")) return THEME_STYLES["Frozen / Elsa"];
  if (n.includes("princess")) return THEME_STYLES["Princess / Royal"];
  if (n.includes("dino") || n.includes("jurassic")) return THEME_STYLES["Dinosaur / Jurassic"];
  if (n.includes("mermaid") || n.includes("sea")) return THEME_STYLES["Mermaid / Under the Sea"];
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
  const ADULT_OCC = /(anniversary|wedding|engage|baby shower|housewarm|retire|farewell|reunion|graduation)/i;
  const isAdult = ADULT_OCC.test(party.occasion || "");
  const artworkUrl = (party.invite_artwork_url || "").trim() || t.artwork || "";
  const heroBackground = artworkUrl
    ? `linear-gradient(180deg,rgba(0,0,0,.05) 0%,rgba(0,0,0,.45) 100%), url('${artworkUrl}') center/cover no-repeat`
    : t.gradient;
  const bodyTint = t.bodyTint || "#fff5f8";
  const corner1 = t.cornerEmojis?.[0] || t.emoji;
  const corner2 = t.cornerEmojis?.[1] || t.emoji;
  const heroEmojiHtml = artworkUrl
    ? ""
    : isAdult
      ? `<div style="font-size:28px;line-height:1;letter-spacing:10px;margin-bottom:12px;opacity:.85;">${(t.heroEmojis || t.emoji).split(" ").slice(0,2).join(" ")}</div>`
      : `<div style="font-size:38px;line-height:1.1;letter-spacing:6px;margin-bottom:12px;">${t.heroEmojis || t.emoji}</div>`;
  const heroTextColor = artworkUrl ? "#fff" : (t.textColor || "#fff");

  return `
<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fdf6f0;">
  <div style="max-width:600px;margin:0 auto;padding:24px 12px;">
    <div style="background:${bodyTint};border-radius:24px;overflow:hidden;border:1px solid ${t.accent}33;box-shadow:0 12px 40px rgba(0,0,0,.1);">

      <!-- Brand bar -->
      <div style="background:#fdf6f0;padding:16px 20px;text-align:center;border-bottom:2px solid ${t.accent};">
        <img src="${logoUrl}" alt="Cake AI Artist" style="height:46px;display:inline-block;" />
        <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-top:4px;font-weight:700;">Party Invitation</div>
      </div>

      <!-- Hero -->
      <div style="background:${heroBackground};padding:36px 24px 30px;text-align:center;color:${heroTextColor};min-height:${artworkUrl ? 320 : 220}px;">
        ${heroEmojiHtml}
        ${t.badge ? `<div style="display:inline-block;margin:6px auto 12px;padding:7px 14px;border-radius:999px;background:rgba(0,0,0,.42);border:1px solid rgba(255,255,255,.4);font-size:11px;font-weight:800;text-transform:uppercase;color:#fff;">${escapeHtml(t.badge)}</div>` : ""}
        <h1 style="margin:14px 0 6px;font-size:34px;line-height:1.05;font-family:${t.font || "Georgia,serif"};font-weight:800;text-shadow:0 3px 16px rgba(0,0,0,.45);">${headline}</h1>
        ${party.occasion ? `<p style="margin:6px 0 0;font-size:13px;opacity:.92;text-transform:capitalize;">${escapeHtml(party.occasion)}</p>` : ""}
      </div>

      <!-- Body -->
      <div style="background:linear-gradient(180deg,${bodyTint} 0%,#ffffff 280px);padding:30px 26px;position:relative;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-size:34px;opacity:.18;color:${t.accent};">${corner1}</td>
            <td align="right" style="font-size:30px;opacity:.16;color:${t.accent};">${corner2}</td>
          </tr>
        </table>

        <p style="font-size:16px;color:#333;margin:6px 0 8px;font-weight:700;">Hi ${safeGuestName},</p>
        <p style="font-size:15px;color:#555;line-height:1.65;margin:0 0 22px;white-space:pre-wrap;">${note}</p>

        <div style="background:#fff;border-radius:12px;padding:16px 16px 16px 18px;margin:0 0 24px;border-left:5px solid ${t.accent};box-shadow:0 4px 14px ${t.accent}22;">
          ${dateLine ? `<p style="margin:0 0 10px;font-size:14px;color:#333;"><strong style="color:${t.accent};">📅 When:</strong> ${escapeHtml(dateLine)}</p>` : ""}
          ${party.venue ? `<p style="margin:0 0 10px;font-size:14px;color:#333;"><strong style="color:${t.accent};">📍 Where:</strong> ${escapeHtml(party.venue)}${party.city ? ", " + escapeHtml(party.city) : ""}</p>` : ""}
          ${party.theme ? `<p style="margin:0;font-size:14px;color:#333;"><strong style="color:${t.accent};">✨ Theme:</strong> ${escapeHtml(party.theme)}</p>` : ""}
        </div>

        <div style="text-align:center;margin:28px 0 18px;">
          <a href="${rsvpUrl}" style="display:inline-block;background:${t.gradient};color:${t.textColor || "#fff"};text-decoration:none;padding:16px 42px;border-radius:30px;font-weight:bold;font-size:16px;box-shadow:0 10px 24px ${t.accent}55;">RSVP Now →</a>
          <p style="margin:12px 0 0;font-size:12px;color:#999;">Tap to let ${safeHost} know if you can make it.</p>
        </div>

        <div style="border-top:1px solid ${t.accent}55;padding-top:18px;margin-top:18px;text-align:center;">
          <p style="font-size:13px;color:#333;margin:0 0 6px;line-height:1.5;font-weight:600;">
            ✨ Crafted with <strong style="color:${t.accent};">Cake AI Artist</strong>
          </p>
          <p style="font-size:12px;color:#444;margin:0 0 12px;">Design your own AI cake, invite, and party look in minutes.</p>
          <p style="margin:6px 0 0;">
            <a href="https://cakeaiartist.com/?utm_source=party_invite&utm_medium=email&utm_campaign=invite_footer" style="color:${t.accent};text-decoration:none;font-weight:700;font-size:12px;margin:0 8px;">Design your own cake →</a>
            <a href="https://cakeaiartist.com/party-planner?utm_source=party_invite&utm_medium=email&utm_campaign=invite_footer" style="color:${t.accent};text-decoration:none;font-weight:700;font-size:12px;margin:0 8px;">Plan a party free →</a>
          </p>
        </div>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#bbb;margin:18px 0 0;">Powered by Cake AI Artist · cakeaiartist.com</p>
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
