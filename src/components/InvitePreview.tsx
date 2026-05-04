import { useEffect } from "react";
import cakeLogo from "@/assets/logo.png";
import superheroArmorActionArt from "@/assets/invite-superhero-armor-action.jpg";

// Theme styles shared between the in-app preview and the email render.
// Keep keys in sync with TRENDING_THEMES in PartyPlannerDetail.tsx.
export type ThemeStyle = {
  gradient: string;
  accent: string;
  emoji: string;
  heroEmojis?: string[];
  badge?: string;
  font: string;
  textColor: string;
  artwork?: string;
  pattern?: string;
};

export const DEFAULT_THEME: ThemeStyle = {
  gradient: "linear-gradient(135deg,#ff6b9d 0%,#c44569 50%,#8e44ad 100%)",
  accent: "#c44569",
  emoji: "🎉",
  heroEmojis: ["🎂", "🎈", "✨", "🎁", "🥳"],
  badge: "A celebration made sweeter",
  font: "Georgia, serif",
  textColor: "#ffffff",
  pattern: "radial-gradient(circle at 18% 24%, rgba(255,255,255,.32) 0 8px, transparent 9px), radial-gradient(circle at 82% 18%, rgba(255,255,255,.22) 0 12px, transparent 13px)",
};

export const THEME_STYLES: Record<string, ThemeStyle> = {
  "Space / Astronaut": {
    gradient: "linear-gradient(135deg,#0b1437 0%,#3b1d6b 60%,#7a2dcf 100%)",
    accent: "#9ad0ff",
    emoji: "🚀",
    heroEmojis: ["🚀", "🪐", "👨‍🚀", "🌕", "✨"],
    badge: "Mission control says: party launch approved",
    font: "'Orbitron', Georgia, serif",
    textColor: "#e9f1ff",
    pattern: "radial-gradient(circle at 20% 22%, rgba(255,255,255,.55) 0 2px, transparent 3px), radial-gradient(circle at 72% 34%, rgba(154,208,255,.5) 0 3px, transparent 4px), radial-gradient(circle at 80% 78%, rgba(255,255,255,.38) 0 2px, transparent 3px)",
  },
  "Iron Man / Avengers": {
    gradient: "linear-gradient(135deg,#7a0e0e 0%,#c11d1d 50%,#f5b400 100%)",
    accent: "#ffd166",
    emoji: "⚡",
    heroEmojis: ["🦾", "🛡️", "⚡", "🔥", "💥"],
    badge: "Suit up — the birthday squad is assembling",
    font: "'Bangers', Impact, Georgia, serif",
    textColor: "#fff",
    artwork: superheroArmorActionArt,
    pattern: "repeating-linear-gradient(135deg, rgba(255,255,255,.12) 0 10px, transparent 10px 22px)",
  },
  "Spider-Man": {
    gradient: "linear-gradient(135deg,#b00020 0%,#1a47b8 100%)",
    accent: "#ffd700",
    emoji: "🕸️",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Star Wars": {
    gradient: "linear-gradient(135deg,#000000 0%,#1a1a2e 60%,#ffe81f 100%)",
    accent: "#ffe81f",
    emoji: "✨",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Frozen / Elsa": {
    gradient: "linear-gradient(135deg,#a8e6ff 0%,#5fb8e6 60%,#7c3aed 100%)",
    accent: "#dff6ff",
    emoji: "❄️",
    font: "'Brush Script MT', cursive",
    textColor: "#0b2545",
  },
  "Barbie Pink": {
    gradient: "linear-gradient(135deg,#ff4fa3 0%,#ff77c6 50%,#ffb3d9 100%)",
    accent: "#ffe0f0",
    emoji: "💖",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  Bluey: {
    gradient: "linear-gradient(135deg,#1976d2 0%,#42a5f5 100%)",
    accent: "#fff59d",
    emoji: "🐶",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Taylor Swift Eras": {
    gradient: "linear-gradient(135deg,#7b2cbf 0%,#c77dff 50%,#ffd700 100%)",
    accent: "#ffd700",
    emoji: "🎤",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  Cocomelon: {
    gradient: "linear-gradient(135deg,#79c142 0%,#fdd835 100%)",
    accent: "#fff",
    emoji: "🍉",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Harry Potter": {
    gradient: "linear-gradient(135deg,#1a1a2e 0%,#5a189a 60%,#a47148 100%)",
    accent: "#d4af37",
    emoji: "⚡",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Floral Garden": {
    gradient: "linear-gradient(135deg,#ffd1dc 0%,#ffafbd 60%,#a8e6cf 100%)",
    accent: "#7c9473",
    emoji: "🌸",
    font: "Georgia, serif",
    textColor: "#3a3a3a",
  },
  "Boho Chic": {
    gradient: "linear-gradient(135deg,#d4a574 0%,#c08552 60%,#5e503f 100%)",
    accent: "#f6dfbe",
    emoji: "🌿",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Disco / Y2K": {
    gradient: "linear-gradient(135deg,#ff00cc 0%,#3333ff 50%,#00ffea 100%)",
    accent: "#fff",
    emoji: "🪩",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Unicorn & Rainbow": {
    gradient: "linear-gradient(135deg,#ff9a9e 0%,#fad0c4 30%,#a18cd1 70%,#fbc2eb 100%)",
    accent: "#fff",
    emoji: "🦄",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Pastel Minimal": {
    gradient: "linear-gradient(135deg,#f7e8e3 0%,#e8d5e8 100%)",
    accent: "#a78bfa",
    emoji: "🌷",
    font: "Georgia, serif",
    textColor: "#3a3a3a",
  },
  "Tropical Luau": {
    gradient: "linear-gradient(135deg,#06b6d4 0%,#10b981 60%,#facc15 100%)",
    accent: "#fff",
    emoji: "🌺",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Black & Gold Elegance": {
    gradient: "linear-gradient(135deg,#000 0%,#1a1a1a 60%,#d4af37 100%)",
    accent: "#d4af37",
    emoji: "✨",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Retro 90s": {
    gradient: "linear-gradient(135deg,#f72585 0%,#7209b7 50%,#3a0ca3 100%)",
    accent: "#fff",
    emoji: "📼",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Sports / Football": {
    gradient: "linear-gradient(135deg,#0b3d2e 0%,#1d8348 100%)",
    accent: "#fff",
    emoji: "⚽",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Spiritual / ISKCON": {
    gradient: "linear-gradient(135deg,#ff9933 0%,#ffcc66 100%)",
    accent: "#7a2e0e",
    emoji: "🕉️",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Peppa Pig": {
    gradient: "linear-gradient(135deg,#ff8fb1 0%,#ffc1d6 100%)",
    accent: "#fff",
    emoji: "🐷",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Paw Patrol": {
    gradient: "linear-gradient(135deg,#0e7490 0%,#dc2626 100%)",
    accent: "#fde047",
    emoji: "🐾",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Dinosaur / Jurassic": {
    gradient: "linear-gradient(135deg,#365314 0%,#65a30d 60%,#fbbf24 100%)",
    accent: "#fff",
    emoji: "🦖",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Mermaid / Under the Sea": {
    gradient: "linear-gradient(135deg,#0891b2 0%,#22d3ee 60%,#a78bfa 100%)",
    accent: "#fff",
    emoji: "🧜‍♀️",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Construction / Trucks": {
    gradient: "linear-gradient(135deg,#facc15 0%,#f59e0b 60%,#1f2937 100%)",
    accent: "#fff",
    emoji: "🚧",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Jungle Safari": {
    gradient: "linear-gradient(135deg,#3f6212 0%,#a16207 100%)",
    accent: "#fde68a",
    emoji: "🦁",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  Pokemon: {
    gradient: "linear-gradient(135deg,#dc2626 0%,#fbbf24 100%)",
    accent: "#fff",
    emoji: "⚡",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  Minecraft: {
    gradient: "linear-gradient(135deg,#365314 0%,#16a34a 60%,#78350f 100%)",
    accent: "#fff",
    emoji: "⛏️",
    font: "'Courier New', monospace",
    textColor: "#fff",
  },
  "Princess / Royal": {
    gradient: "linear-gradient(135deg,#f9a8d4 0%,#a78bfa 60%,#fbbf24 100%)",
    accent: "#fff",
    emoji: "👑",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Garden Tea Party": {
    gradient: "linear-gradient(135deg,#fce7f3 0%,#bae6fd 60%,#bbf7d0 100%)",
    accent: "#7c2d12",
    emoji: "🫖",
    font: "Georgia, serif",
    textColor: "#3a3a3a",
  },
  "Carnival / Circus": {
    gradient: "linear-gradient(135deg,#ef4444 0%,#fbbf24 50%,#3b82f6 100%)",
    accent: "#fff",
    emoji: "🎪",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Wonder Woman": {
    gradient: "linear-gradient(135deg,#991b1b 0%,#1e3a8a 60%,#fbbf24 100%)",
    accent: "#fbbf24",
    emoji: "⭐",
    font: "Georgia, serif",
    textColor: "#fff",
  },
  "Hot Wheels": {
    gradient: "linear-gradient(135deg,#dc2626 0%,#1f2937 100%)",
    accent: "#fbbf24",
    emoji: "🏎️",
    font: "'Impact', Georgia, serif",
    textColor: "#fff",
  },
};

export const getThemeStyle = (theme?: string | null): ThemeStyle => {
  if (!theme) return DEFAULT_THEME;
  return THEME_STYLES[theme] || DEFAULT_THEME;
};

const FONT_LINK_ID = "cake-invite-fonts";

const ensureInviteFonts = () => {
  if (typeof document === "undefined" || document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Bangers&family=Orbitron:wght@700;800&family=Luckiest+Guy&display=swap";
  document.head.appendChild(link);
};

interface InvitePreviewProps {
  party: any;
  hostName?: string;
  guestName?: string;
  headline?: string;
  message?: string;
  cakeImageUrl?: string | null;
}

const formatDate = (iso?: string | null, tz?: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
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

export const InvitePreview = ({
  party,
  hostName = "Your friend",
  guestName = "Friend",
  headline,
  message,
  cakeImageUrl,
}: InvitePreviewProps) => {
  useEffect(() => {
    ensureInviteFonts();
  }, []);

  const t = getThemeStyle(party?.theme);
  const finalHeadline = headline?.trim() || `You're invited to ${party?.title || "the party"}!`;
  const finalMessage =
    message?.trim() ||
    `${hostName} would love for you to join the celebration. Expect smiles, cake, surprises, and a party table full of little wow moments.`;
  const dateLine = formatDate(party?.event_date, party?.event_timezone);

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
        background: "#fdf6f0",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,.12)",
      }}
    >
      <div
        style={{
          background: `${t.pattern || ""}, ${t.artwork ? `linear-gradient(rgba(0,0,0,.18), rgba(0,0,0,.42)), url(${t.artwork})` : t.gradient}`,
          backgroundSize: t.artwork ? "cover" : "auto",
          backgroundPosition: "center",
          color: t.textColor,
          padding: "34px 24px 30px",
          minHeight: t.artwork ? 310 : 250,
          textAlign: "center",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ fontSize: 30, lineHeight: 1.1, letterSpacing: 6 }}>{(t.heroEmojis || [t.emoji]).join(" ")}</div>
        {t.badge && (
          <div style={{ display: "inline-block", alignSelf: "center", marginTop: 16, padding: "7px 14px", borderRadius: 999, background: "rgba(0,0,0,.38)", border: "1px solid rgba(255,255,255,.35)", fontSize: 11, fontWeight: 800, letterSpacing: 0, textTransform: "uppercase" }}>
            {t.badge}
          </div>
        )}
        <h2
          style={{
            margin: "14px 0 8px",
            fontSize: 34,
            fontFamily: t.font,
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1.02,
            textShadow: "0 3px 16px rgba(0,0,0,.4)",
          }}
        >
          {finalHeadline}
        </h2>
        {party?.occasion && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              opacity: 0.9,
              textTransform: "capitalize",
            }}
          >
            {party.occasion}
          </p>
        )}
      </div>

      {cakeImageUrl && (
        <img
          src={cakeImageUrl}
          alt="Cake"
          style={{ width: "100%", display: "block", maxHeight: 220, objectFit: "cover" }}
        />
      )}

      <div style={{ background: "#fff", padding: "28px 24px" }}>
        <p style={{ fontSize: 15, color: "#333", margin: "0 0 6px", fontWeight: 700 }}>Hi {guestName},</p>
        <p
          style={{
            fontSize: 15,
            color: "#555",
            lineHeight: 1.6,
            margin: "0 0 20px",
            whiteSpace: "pre-wrap",
          }}
        >
          {finalMessage}
        </p>

        <div style={{ background: "#fdf6f0", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          {dateLine && (
            <p style={{ margin: "0 0 8px", fontSize: 14, color: "#333" }}>
              <strong>📅 When:</strong> {dateLine}
            </p>
          )}
          {party?.venue && (
            <p style={{ margin: "0 0 8px", fontSize: 14, color: "#333" }}>
              <strong>📍 Where:</strong> {party.venue}
              {party.city ? `, ${party.city}` : ""}
            </p>
          )}
          {party?.theme && (
            <p style={{ margin: 0, fontSize: 14, color: "#333" }}>
              <strong>✨ Theme:</strong> {party.theme}
            </p>
          )}
        </div>

        <div style={{ textAlign: "center", margin: "24px 0 8px" }}>
          <span
            style={{
              display: "inline-block",
              background: t.gradient,
              color: t.textColor,
              padding: "14px 36px",
              borderRadius: 30,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            RSVP Now →
          </span>
        </div>

        <p
          style={{
            fontSize: 12,
            color: "#888",
            textAlign: "center",
            margin: "20px 0 0",
            borderTop: "1px solid #f0e4d7",
            paddingTop: 14,
          }}
        >
          <img src={cakeLogo} alt="Cake AI Artist" loading="lazy" width={120} height={34} style={{ height: 34, width: "auto", display: "block", margin: "0 auto 10px" }} />
          ✨ Made with <strong>Cake AI Artist</strong> — create your own AI cake, invite, and party look at cakeaiartist.com
        </p>
      </div>
    </div>
  );
};
