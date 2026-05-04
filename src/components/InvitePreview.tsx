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
  bodyTint?: string; // soft body background tint, hex or rgba
  cornerEmojis?: string[]; // 2 emojis used as floating corner accents
  artwork?: string;
  pattern?: string;
};

const SPARKLE_PATTERN = "radial-gradient(circle at 18% 24%, rgba(255,255,255,.45) 0 4px, transparent 5px), radial-gradient(circle at 82% 18%, rgba(255,255,255,.32) 0 6px, transparent 7px), radial-gradient(circle at 70% 80%, rgba(255,255,255,.28) 0 4px, transparent 5px)";
const DOTS_PATTERN = "radial-gradient(circle at 18% 24%, rgba(255,255,255,.32) 0 8px, transparent 9px), radial-gradient(circle at 82% 18%, rgba(255,255,255,.22) 0 12px, transparent 13px), radial-gradient(circle at 30% 78%, rgba(255,255,255,.18) 0 10px, transparent 11px)";
const STRIPES_PATTERN = "repeating-linear-gradient(135deg, rgba(255,255,255,.14) 0 12px, transparent 12px 26px)";
const STARS_PATTERN = "radial-gradient(circle at 22% 28%, rgba(255,255,255,.7) 0 2px, transparent 3px), radial-gradient(circle at 60% 18%, rgba(255,255,255,.55) 0 2px, transparent 3px), radial-gradient(circle at 78% 70%, rgba(255,255,255,.5) 0 2px, transparent 3px), radial-gradient(circle at 30% 80%, rgba(255,255,255,.4) 0 2px, transparent 3px)";

export const DEFAULT_THEME: ThemeStyle = {
  gradient: "linear-gradient(135deg,#ff6b9d 0%,#c44569 50%,#8e44ad 100%)",
  accent: "#c44569",
  emoji: "🎉",
  heroEmojis: ["🎂", "🎈", "✨", "🎁", "🥳"],
  badge: "A celebration made sweeter",
  font: "Georgia, serif",
  textColor: "#ffffff",
  bodyTint: "#fff5f8",
  cornerEmojis: ["🎈", "🎉"],
  pattern: DOTS_PATTERN,
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
    bodyTint: "#f0f3ff",
    cornerEmojis: ["🪐", "🌕"],
    pattern: STARS_PATTERN,
  },
  "Iron Man / Avengers": {
    gradient: "linear-gradient(135deg,#7a0e0e 0%,#c11d1d 50%,#f5b400 100%)",
    accent: "#ffd166",
    emoji: "⚡",
    heroEmojis: ["🦾", "🛡️", "⚡", "🔥", "💥"],
    badge: "Suit up — the birthday squad is assembling",
    font: "'Bangers', Impact, Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fff7e6",
    cornerEmojis: ["🛡️", "⚡"],
    artwork: superheroArmorActionArt,
    pattern: "repeating-linear-gradient(135deg, rgba(255,255,255,.12) 0 10px, transparent 10px 22px)",
  },
  "Spider-Man": {
    gradient: "linear-gradient(135deg,#b00020 0%,#1a47b8 100%)",
    accent: "#ffd700",
    emoji: "🕸️",
    heroEmojis: ["🕷️", "🕸️", "🦸", "💥", "✨"],
    badge: "Your friendly neighborhood party invite",
    font: "'Bangers', Impact, Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fff5f5",
    cornerEmojis: ["🕸️", "🕷️"],
    pattern: STRIPES_PATTERN,
  },
  "Star Wars": {
    gradient: "linear-gradient(135deg,#000000 0%,#1a1a2e 60%,#ffe81f 100%)",
    accent: "#ffe81f",
    emoji: "✨",
    heroEmojis: ["⚔️", "🌌", "🛸", "✨", "🪐"],
    badge: "May the party be with you",
    font: "'Orbitron', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fffbe6",
    cornerEmojis: ["⚔️", "🌌"],
    pattern: STARS_PATTERN,
  },
  "Frozen / Elsa": {
    gradient: "linear-gradient(135deg,#a8e6ff 0%,#5fb8e6 60%,#7c3aed 100%)",
    accent: "#5fb8e6",
    emoji: "❄️",
    heroEmojis: ["❄️", "👑", "✨", "🏰", "⛄"],
    badge: "Let it go and join the party",
    font: "'Brush Script MT', cursive",
    textColor: "#0b2545",
    bodyTint: "#f0faff",
    cornerEmojis: ["❄️", "✨"],
    pattern: SPARKLE_PATTERN,
  },
  "Barbie Pink": {
    gradient: "linear-gradient(135deg,#ff4fa3 0%,#ff77c6 50%,#ffb3d9 100%)",
    accent: "#ff4fa3",
    emoji: "💖",
    heroEmojis: ["💖", "👛", "👠", "✨", "🎀"],
    badge: "Hi Barbie! Hi party!",
    font: "'Luckiest Guy', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fff0f7",
    cornerEmojis: ["🎀", "💖"],
    pattern: SPARKLE_PATTERN,
  },
  Bluey: {
    gradient: "linear-gradient(135deg,#1976d2 0%,#42a5f5 100%)",
    accent: "#fff59d",
    emoji: "🐶",
    heroEmojis: ["🐶", "🦴", "🎾", "🏠", "✨"],
    badge: "Wackadoo! It's party time",
    font: "Georgia, serif",
    textColor: "#fff",
    bodyTint: "#eef6ff",
    cornerEmojis: ["🐾", "🎾"],
    pattern: DOTS_PATTERN,
  },
  "Taylor Swift Eras": {
    gradient: "linear-gradient(135deg,#7b2cbf 0%,#c77dff 50%,#ffd700 100%)",
    accent: "#ffd700",
    emoji: "🎤",
    heroEmojis: ["🎤", "✨", "🪩", "💜", "🎸"],
    badge: "It's me, hi — you're invited, it's me",
    font: "'Luckiest Guy', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#faf0ff",
    cornerEmojis: ["✨", "🪩"],
    pattern: SPARKLE_PATTERN,
  },
  Cocomelon: {
    gradient: "linear-gradient(135deg,#79c142 0%,#fdd835 100%)",
    accent: "#79c142",
    emoji: "🍉",
    heroEmojis: ["🍉", "🎵", "👶", "🌈", "✨"],
    badge: "Sing, dance, and celebrate together",
    font: "Georgia, serif",
    textColor: "#fff",
    bodyTint: "#f5fff0",
    cornerEmojis: ["🎵", "🍉"],
    pattern: DOTS_PATTERN,
  },
  "Harry Potter": {
    gradient: "linear-gradient(135deg,#1a1a2e 0%,#5a189a 60%,#a47148 100%)",
    accent: "#d4af37",
    emoji: "⚡",
    heroEmojis: ["⚡", "🪄", "🦉", "📜", "✨"],
    badge: "Your Hogwarts letter has arrived",
    font: "'Fraunces', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#f7f1e6",
    cornerEmojis: ["🪄", "🦉"],
    pattern: STARS_PATTERN,
  },
  "Floral Garden": {
    gradient: "linear-gradient(135deg,#ffd1dc 0%,#ffafbd 60%,#a8e6cf 100%)",
    accent: "#7c9473",
    emoji: "🌸",
    heroEmojis: ["🌸", "🌷", "🌿", "🌼", "✨"],
    badge: "A blooming celebration awaits",
    font: "'Fraunces', Georgia, serif",
    textColor: "#3a3a3a",
    bodyTint: "#fff5f8",
    cornerEmojis: ["🌸", "🌿"],
    pattern: SPARKLE_PATTERN,
  },
  "Boho Chic": {
    gradient: "linear-gradient(135deg,#d4a574 0%,#c08552 60%,#5e503f 100%)",
    accent: "#d4a574",
    emoji: "🌿",
    heroEmojis: ["🌿", "✨", "🪶", "🌾", "🕯️"],
    badge: "Earthy, warm, and beautifully you",
    font: "'Fraunces', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fbf3e8",
    cornerEmojis: ["🌿", "🪶"],
    pattern: STRIPES_PATTERN,
  },
  "Disco / Y2K": {
    gradient: "linear-gradient(135deg,#ff00cc 0%,#3333ff 50%,#00ffea 100%)",
    accent: "#ff00cc",
    emoji: "🪩",
    heroEmojis: ["🪩", "💃", "🕺", "✨", "🎶"],
    badge: "Get ready to groove",
    font: "'Luckiest Guy', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fff0fb",
    cornerEmojis: ["🪩", "✨"],
    pattern: SPARKLE_PATTERN,
  },
  "Unicorn & Rainbow": {
    gradient: "linear-gradient(135deg,#ff9a9e 0%,#fad0c4 30%,#a18cd1 70%,#fbc2eb 100%)",
    accent: "#a18cd1",
    emoji: "🦄",
    heroEmojis: ["🦄", "🌈", "✨", "🌟", "🎀"],
    badge: "A magical, sparkly celebration",
    font: "'Luckiest Guy', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fff0fa",
    cornerEmojis: ["🦄", "🌈"],
    pattern: SPARKLE_PATTERN,
  },
  "Pastel Minimal": {
    gradient: "linear-gradient(135deg,#f7e8e3 0%,#e8d5e8 100%)",
    accent: "#a78bfa",
    emoji: "🌷",
    heroEmojis: ["🌷", "✨", "🤍", "🎀", "🌸"],
    badge: "Soft, simple, lovely",
    font: "'Fraunces', Georgia, serif",
    textColor: "#3a3a3a",
    bodyTint: "#faf5ff",
    cornerEmojis: ["🌷", "✨"],
    pattern: SPARKLE_PATTERN,
  },
  "Tropical Luau": {
    gradient: "linear-gradient(135deg,#06b6d4 0%,#10b981 60%,#facc15 100%)",
    accent: "#facc15",
    emoji: "🌺",
    heroEmojis: ["🌺", "🍍", "🌴", "🥥", "✨"],
    badge: "Aloha — let's party island style",
    font: "Georgia, serif",
    textColor: "#fff",
    bodyTint: "#f0fdf9",
    cornerEmojis: ["🌴", "🌺"],
    pattern: DOTS_PATTERN,
  },
  "Black & Gold Elegance": {
    gradient: "linear-gradient(135deg,#000 0%,#1a1a1a 60%,#d4af37 100%)",
    accent: "#d4af37",
    emoji: "✨",
    heroEmojis: ["✨", "🥂", "🖤", "🌟", "🎩"],
    badge: "An elegant evening, just for you",
    font: "'Fraunces', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fffaf0",
    cornerEmojis: ["✨", "🥂"],
    pattern: STARS_PATTERN,
  },
  "Retro 90s": {
    gradient: "linear-gradient(135deg,#f72585 0%,#7209b7 50%,#3a0ca3 100%)",
    accent: "#f72585",
    emoji: "📼",
    heroEmojis: ["📼", "🕹️", "📀", "✨", "🎮"],
    badge: "Totally rad — you're invited",
    font: "'Luckiest Guy', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fff0f8",
    cornerEmojis: ["📼", "🕹️"],
    pattern: STRIPES_PATTERN,
  },
  "Sports / Football": {
    gradient: "linear-gradient(135deg,#0b3d2e 0%,#1d8348 100%)",
    accent: "#fbbf24",
    emoji: "⚽",
    heroEmojis: ["⚽", "🏆", "🥅", "🎽", "✨"],
    badge: "Game on — be there or be square",
    font: "'Bangers', Impact, Georgia, serif",
    textColor: "#fff",
    bodyTint: "#f0fff5",
    cornerEmojis: ["⚽", "🏆"],
    pattern: STRIPES_PATTERN,
  },
  "Spiritual / ISKCON": {
    gradient: "linear-gradient(135deg,#ff9933 0%,#ffcc66 100%)",
    accent: "#7a2e0e",
    emoji: "🕉️",
    heroEmojis: ["🪷", "🕉️", "🪈", "🌼", "✨"],
    badge: "A soulful celebration with sweetness and blessings",
    font: "'Fraunces', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fff7e6",
    cornerEmojis: ["🪷", "🕉️"],
    pattern: "radial-gradient(circle at 20% 22%, rgba(255,255,255,.34) 0 10px, transparent 11px), radial-gradient(circle at 78% 30%, rgba(122,46,14,.18) 0 18px, transparent 19px), repeating-linear-gradient(90deg, rgba(255,255,255,.12) 0 2px, transparent 2px 22px)",
  },
  "Peppa Pig": {
    gradient: "linear-gradient(135deg,#ff8fb1 0%,#ffc1d6 100%)",
    accent: "#ff8fb1",
    emoji: "🐷",
    heroEmojis: ["🐷", "🌧️", "💕", "🌈", "✨"],
    badge: "Snorts of joy — let's party",
    font: "'Luckiest Guy', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fff5f8",
    cornerEmojis: ["🐷", "💕"],
    pattern: DOTS_PATTERN,
  },
  "Paw Patrol": {
    gradient: "linear-gradient(135deg,#0e7490 0%,#dc2626 100%)",
    accent: "#fde047",
    emoji: "🐾",
    heroEmojis: ["🐾", "🚒", "🚓", "🦴", "✨"],
    badge: "No job is too big — no pup is too small",
    font: "'Bangers', Impact, Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fff8e1",
    cornerEmojis: ["🐾", "🚒"],
    pattern: DOTS_PATTERN,
  },
  "Dinosaur / Jurassic": {
    gradient: "linear-gradient(135deg,#365314 0%,#65a30d 60%,#fbbf24 100%)",
    accent: "#65a30d",
    emoji: "🦖",
    heroEmojis: ["🦖", "🦕", "🌿", "🥚", "✨"],
    badge: "A roaringly good celebration",
    font: "'Bangers', Impact, Georgia, serif",
    textColor: "#fff",
    bodyTint: "#f7fff0",
    cornerEmojis: ["🦖", "🌿"],
    pattern: STRIPES_PATTERN,
  },
  "Mermaid / Under the Sea": {
    gradient: "linear-gradient(135deg,#0891b2 0%,#22d3ee 60%,#a78bfa 100%)",
    accent: "#22d3ee",
    emoji: "🧜‍♀️",
    heroEmojis: ["🧜‍♀️", "🐚", "🐠", "🌊", "✨"],
    badge: "Dive in — the party's making waves",
    font: "'Brush Script MT', cursive",
    textColor: "#fff",
    bodyTint: "#f0fcff",
    cornerEmojis: ["🐚", "🌊"],
    pattern: SPARKLE_PATTERN,
  },
  "Construction / Trucks": {
    gradient: "linear-gradient(135deg,#facc15 0%,#f59e0b 60%,#1f2937 100%)",
    accent: "#f59e0b",
    emoji: "🚧",
    heroEmojis: ["🚧", "🚜", "🔧", "🏗️", "✨"],
    badge: "Hard hats on — celebration in progress",
    font: "'Bangers', Impact, Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fffaf0",
    cornerEmojis: ["🚧", "🚜"],
    pattern: STRIPES_PATTERN,
  },
  "Jungle Safari": {
    gradient: "linear-gradient(135deg,#3f6212 0%,#a16207 100%)",
    accent: "#fde68a",
    emoji: "🦁",
    heroEmojis: ["🦁", "🐘", "🦓", "🌴", "✨"],
    badge: "Time for a wild adventure",
    font: "'Fraunces', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fff8e6",
    cornerEmojis: ["🦁", "🌴"],
    pattern: STRIPES_PATTERN,
  },
  Pokemon: {
    gradient: "linear-gradient(135deg,#dc2626 0%,#fbbf24 100%)",
    accent: "#dc2626",
    emoji: "⚡",
    heroEmojis: ["⚡", "🎮", "🔴", "✨", "🏆"],
    badge: "Gotta party 'em all",
    font: "'Luckiest Guy', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fff5e6",
    cornerEmojis: ["⚡", "🏆"],
    pattern: DOTS_PATTERN,
  },
  Minecraft: {
    gradient: "linear-gradient(135deg,#365314 0%,#16a34a 60%,#78350f 100%)",
    accent: "#16a34a",
    emoji: "⛏️",
    heroEmojis: ["⛏️", "🟫", "🟩", "💎", "✨"],
    badge: "Build, mine, celebrate",
    font: "'Courier New', monospace",
    textColor: "#fff",
    bodyTint: "#f0fff0",
    cornerEmojis: ["⛏️", "💎"],
    pattern: STRIPES_PATTERN,
  },
  "Princess / Royal": {
    gradient: "linear-gradient(135deg,#f9a8d4 0%,#a78bfa 60%,#fbbf24 100%)",
    accent: "#a78bfa",
    emoji: "👑",
    heroEmojis: ["👑", "🏰", "✨", "🌹", "💎"],
    badge: "A royal invitation just for you",
    font: "'Fraunces', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fdf4ff",
    cornerEmojis: ["👑", "🌹"],
    pattern: SPARKLE_PATTERN,
  },
  "Garden Tea Party": {
    gradient: "linear-gradient(135deg,#fce7f3 0%,#bae6fd 60%,#bbf7d0 100%)",
    accent: "#7c2d12",
    emoji: "🫖",
    heroEmojis: ["🫖", "🌷", "🍰", "🌿", "✨"],
    badge: "Tea, treats, and lovely company",
    font: "'Fraunces', Georgia, serif",
    textColor: "#3a3a3a",
    bodyTint: "#fdf6f8",
    cornerEmojis: ["🫖", "🌷"],
    pattern: SPARKLE_PATTERN,
  },
  "Carnival / Circus": {
    gradient: "linear-gradient(135deg,#ef4444 0%,#fbbf24 50%,#3b82f6 100%)",
    accent: "#ef4444",
    emoji: "🎪",
    heroEmojis: ["🎪", "🎠", "🎈", "🤹", "✨"],
    badge: "Step right up to the greatest party",
    font: "'Bangers', Impact, Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fff5f0",
    cornerEmojis: ["🎪", "🎠"],
    pattern: STRIPES_PATTERN,
  },
  "Wonder Woman": {
    gradient: "linear-gradient(135deg,#991b1b 0%,#1e3a8a 60%,#fbbf24 100%)",
    accent: "#fbbf24",
    emoji: "⭐",
    heroEmojis: ["⭐", "🛡️", "💪", "✨", "👑"],
    badge: "Calling all wonder women",
    font: "'Bangers', Impact, Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fff8e6",
    cornerEmojis: ["⭐", "🛡️"],
    pattern: STARS_PATTERN,
  },
  "Hot Wheels": {
    gradient: "linear-gradient(135deg,#dc2626 0%,#1f2937 100%)",
    accent: "#fbbf24",
    emoji: "🏎️",
    heroEmojis: ["🏎️", "🏁", "🔥", "✨", "🛞"],
    badge: "Start your engines — party time",
    font: "'Bangers', Impact, Georgia, serif",
    textColor: "#fff",
    bodyTint: "#fff5f0",
    cornerEmojis: ["🏎️", "🏁"],
    pattern: STRIPES_PATTERN,
  },
  // ───── Soothing & elegant themes (anniversaries, weddings, baby showers, etc.) ─────
  "Romantic Rose Gold": {
    gradient: "linear-gradient(135deg,#fde2e4 0%,#f5b7c0 50%,#d4a59a 100%)",
    accent: "#b76e79",
    emoji: "🌹",
    heroEmojis: ["🌹", "💕", "✨", "🥂", "💍"],
    badge: "An evening of soft light and sweet moments",
    font: "'Brush Script MT', cursive",
    textColor: "#5a2a3a",
    bodyTint: "#fff5f5",
    cornerEmojis: ["🌹", "💕"],
    pattern: SPARKLE_PATTERN,
  },
  "Candlelight & Champagne": {
    gradient: "linear-gradient(135deg,#fff8e7 0%,#f5e1a4 60%,#d4af37 100%)",
    accent: "#a47148",
    emoji: "🕯️",
    heroEmojis: ["🕯️", "🥂", "✨", "🌟", "💫"],
    badge: "A warm, glowing celebration awaits",
    font: "'Fraunces', Georgia, serif",
    textColor: "#3a2a1a",
    bodyTint: "#fffaf0",
    cornerEmojis: ["🕯️", "🥂"],
    pattern: SPARKLE_PATTERN,
  },
  "Vintage Sepia Romance": {
    gradient: "linear-gradient(135deg,#f3e7d3 0%,#d6b890 60%,#8b6f47 100%)",
    accent: "#8b6f47",
    emoji: "📜",
    heroEmojis: ["📜", "🌿", "✨", "🤎", "🌾"],
    badge: "A timeless love, beautifully celebrated",
    font: "'Fraunces', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#faf3e8",
    cornerEmojis: ["📜", "🌿"],
    pattern: STRIPES_PATTERN,
  },
  "Moonlight & Stars": {
    gradient: "linear-gradient(135deg,#0b1437 0%,#1e2a5e 60%,#5a6cb5 100%)",
    accent: "#c0c8e8",
    emoji: "🌙",
    heroEmojis: ["🌙", "⭐", "✨", "💫", "🌌"],
    badge: "Under a quiet sky, we celebrate",
    font: "'Fraunces', Georgia, serif",
    textColor: "#f0f4ff",
    bodyTint: "#f4f6ff",
    cornerEmojis: ["🌙", "⭐"],
    pattern: STARS_PATTERN,
  },
  "Ocean Breeze": {
    gradient: "linear-gradient(135deg,#e0f7fa 0%,#a8dadc 60%,#5b9aa0 100%)",
    accent: "#3a7d7e",
    emoji: "🌊",
    heroEmojis: ["🌊", "🐚", "✨", "🤍", "🌿"],
    badge: "Calm waves, warm hearts, simple joy",
    font: "'Fraunces', Georgia, serif",
    textColor: "#1a3a4a",
    bodyTint: "#f0fbff",
    cornerEmojis: ["🌊", "🐚"],
    pattern: SPARKLE_PATTERN,
  },
  "Lavender Fields": {
    gradient: "linear-gradient(135deg,#e6d6f2 0%,#c8a8e0 60%,#8a6bb1 100%)",
    accent: "#6b4a8a",
    emoji: "💜",
    heroEmojis: ["💜", "🌿", "✨", "🌸", "🤍"],
    badge: "A gentle, fragrant celebration",
    font: "'Fraunces', Georgia, serif",
    textColor: "#fff",
    bodyTint: "#faf5ff",
    cornerEmojis: ["💜", "🌿"],
    pattern: SPARKLE_PATTERN,
  },
  "Eternal Bond": {
    gradient: "linear-gradient(135deg,#5c0a14 0%,#8b1a2b 50%,#d4af37 100%)",
    accent: "#d4af37",
    emoji: "💍",
    heroEmojis: ["💍", "🌹", "✨", "🥂", "💕"],
    badge: "Years of love, beautifully celebrated",
    font: "'Brush Script MT', cursive",
    textColor: "#fff",
    bodyTint: "#fff5f5",
    cornerEmojis: ["💍", "🌹"],
    pattern: SPARKLE_PATTERN,
  },
  "Soft Sunrise": {
    gradient: "linear-gradient(135deg,#ffe5d4 0%,#ffc1a6 50%,#f5a486 100%)",
    accent: "#c66a4a",
    emoji: "🌅",
    heroEmojis: ["🌅", "🤍", "✨", "🌸", "💛"],
    badge: "New beginnings, warm welcomes",
    font: "'Fraunces', Georgia, serif",
    textColor: "#5a2a1a",
    bodyTint: "#fff8f3",
    cornerEmojis: ["🌅", "🤍"],
    pattern: SPARKLE_PATTERN,
  },
};

export const getThemeStyle = (theme?: string | null): ThemeStyle => {
  if (!theme) return DEFAULT_THEME;
  const direct = THEME_STYLES[theme];
  if (direct) return direct;
  const normalized = theme.toLowerCase();
  if (normalized.includes("iron") || normalized.includes("avenger") || normalized.includes("superhero")) return THEME_STYLES["Iron Man / Avengers"];
  if (normalized.includes("space") || normalized.includes("astronaut") || normalized.includes("galaxy")) return THEME_STYLES["Space / Astronaut"];
  if (normalized.includes("iskcon") || normalized.includes("spiritual") || normalized.includes("krishna")) return THEME_STYLES["Spiritual / ISKCON"];
  if (normalized.includes("unicorn") || normalized.includes("rainbow")) return THEME_STYLES["Unicorn & Rainbow"];
  if (normalized.includes("barbie")) return THEME_STYLES["Barbie Pink"];
  if (normalized.includes("frozen") || normalized.includes("elsa")) return THEME_STYLES["Frozen / Elsa"];
  if (normalized.includes("princess")) return THEME_STYLES["Princess / Royal"];
  if (normalized.includes("dino") || normalized.includes("jurassic")) return THEME_STYLES["Dinosaur / Jurassic"];
  if (normalized.includes("mermaid") || normalized.includes("sea")) return THEME_STYLES["Mermaid / Under the Sea"];
  if (normalized.includes("rose gold") || normalized.includes("romantic rose")) return THEME_STYLES["Romantic Rose Gold"];
  if (normalized.includes("candlelight") || normalized.includes("champagne")) return THEME_STYLES["Candlelight & Champagne"];
  if (normalized.includes("vintage") || normalized.includes("sepia")) return THEME_STYLES["Vintage Sepia Romance"];
  if (normalized.includes("moonlight") || normalized.includes("starry")) return THEME_STYLES["Moonlight & Stars"];
  if (normalized.includes("ocean") || normalized.includes("breeze")) return THEME_STYLES["Ocean Breeze"];
  if (normalized.includes("lavender")) return THEME_STYLES["Lavender Fields"];
  if (normalized.includes("eternal") || normalized.includes("burgundy")) return THEME_STYLES["Eternal Bond"];
  if (normalized.includes("sunrise") || normalized.includes("peach")) return THEME_STYLES["Soft Sunrise"];
  return DEFAULT_THEME;
};

const FONT_LINK_ID = "cake-invite-fonts";

const ensureInviteFonts = () => {
  if (typeof document === "undefined" || document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Bangers&family=Orbitron:wght@700;800&family=Luckiest+Guy&family=Fraunces:wght@600;800&display=swap";
  document.head.appendChild(link);
};

interface InvitePreviewProps {
  party: any;
  hostName?: string;
  guestName?: string;
  headline?: string;
  message?: string;
  cakeImageUrl?: string | null;
  artworkUrl?: string | null;
}

export const ADULT_OCC_RX_PREVIEW = /(anniversary|wedding|engage|baby shower|housewarm|retire|farewell|reunion|graduation)/i;

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
  artworkUrl,
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
  const isAdultOccasion = ADULT_OCC_RX_PREVIEW.test((party?.occasion || "").toString());
  const effectiveArtwork = artworkUrl || t.artwork || null;
  const heroBackground = effectiveArtwork
    ? `linear-gradient(180deg, rgba(0,0,0,.05) 0%, rgba(0,0,0,.45) 100%), url(${effectiveArtwork})`
    : [t.pattern, t.gradient].filter(Boolean).join(", ");
  const bodyTint = t.bodyTint || "#fff5f8";
  const corner1 = t.cornerEmojis?.[0] || t.heroEmojis?.[0] || t.emoji;
  const corner2 = t.cornerEmojis?.[1] || t.heroEmojis?.[1] || t.emoji;

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
        background: bodyTint,
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,.12)",
        border: `1px solid ${t.accent}33`,
      }}
    >
      {/* Brand bar */}
      <div
        style={{
          background: "#fdf6f0",
          padding: "14px 20px",
          textAlign: "center",
          borderBottom: `2px solid ${t.accent}`,
        }}
      >
        <img
          src={cakeLogo}
          alt="Cake AI Artist"
          loading="lazy"
          style={{ height: 40, width: "auto", display: "inline-block", verticalAlign: "middle" }}
        />
        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#888",
            marginTop: 4,
            fontWeight: 700,
          }}
        >
          Party Invitation
        </div>
      </div>

      {/* Hero */}
      <div
        style={{
          background: heroBackground,
          backgroundSize: effectiveArtwork ? "cover" : "auto",
          backgroundPosition: "center",
          color: effectiveArtwork ? "#fff" : t.textColor,
          padding: "30px 24px 28px",
          minHeight: effectiveArtwork ? 320 : 230,
          textAlign: "center",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        {!effectiveArtwork && !isAdultOccasion && (
          <div style={{ fontSize: 38, lineHeight: 1.1, letterSpacing: 6 }}>
            {(t.heroEmojis || [t.emoji]).join(" ")}
          </div>
        )}
        {!effectiveArtwork && isAdultOccasion && (
          <div style={{ fontSize: 28, lineHeight: 1, letterSpacing: 10, opacity: 0.85 }}>
            {(t.heroEmojis || [t.emoji]).slice(0, 2).join(" ")}
          </div>
        )}
        {t.badge && (
          <div
            style={{
              display: "inline-block",
              alignSelf: "center",
              marginTop: 14,
              padding: "7px 14px",
              borderRadius: 999,
              background: "rgba(0,0,0,.42)",
              border: "1px solid rgba(255,255,255,.4)",
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            {t.badge}
          </div>
        )}
        <h2
          style={{
            margin: "14px 0 4px",
            fontSize: 34,
            fontFamily: t.font,
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1.05,
            textShadow: "0 3px 16px rgba(0,0,0,.45)",
          }}
        >
          {finalHeadline}
        </h2>
        {party?.occasion && (
          <p style={{ margin: 0, fontSize: 13, opacity: 0.92, textTransform: "capitalize" }}>
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

      {/* Body */}
      <div
        style={{
          background: `linear-gradient(180deg, ${bodyTint} 0%, #ffffff 280px)`,
          padding: "28px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Floating corner emojis — hidden for adult occasions to keep it elegant */}
        {!isAdultOccasion && (
          <>
            <span
              style={{ position: "absolute", top: 10, left: 14, fontSize: 38, opacity: 0.18, transform: "rotate(-12deg)", pointerEvents: "none" }}
              aria-hidden
            >
              {corner1}
            </span>
            <span
              style={{ position: "absolute", top: 14, right: 18, fontSize: 32, opacity: 0.16, transform: "rotate(14deg)", pointerEvents: "none" }}
              aria-hidden
            >
              {corner2}
            </span>
          </>
        )}

        <p style={{ fontSize: 15, color: "#333", margin: "0 0 6px", fontWeight: 700, position: "relative" }}>
          Hi {guestName},
        </p>
        <p
          style={{
            fontSize: 15,
            color: "#555",
            lineHeight: 1.6,
            margin: "0 0 20px",
            whiteSpace: "pre-wrap",
            position: "relative",
          }}
        >
          {finalMessage}
        </p>

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "16px 16px 16px 18px",
            marginBottom: 22,
            borderLeft: `5px solid ${t.accent}`,
            boxShadow: `0 4px 14px ${t.accent}22`,
            position: "relative",
          }}
        >
          {dateLine && (
            <p style={{ margin: "0 0 8px", fontSize: 14, color: "#333" }}>
              <strong style={{ color: t.accent }}>📅 When:</strong> {dateLine}
            </p>
          )}
          {party?.venue && (
            <p style={{ margin: "0 0 8px", fontSize: 14, color: "#333" }}>
              <strong style={{ color: t.accent }}>📍 Where:</strong> {party.venue}
              {party.city ? `, ${party.city}` : ""}
            </p>
          )}
          {party?.theme && (
            <p style={{ margin: 0, fontSize: 14, color: "#333" }}>
              <strong style={{ color: t.accent }}>✨ Theme:</strong> {party.theme}
            </p>
          )}
        </div>

        <div style={{ textAlign: "center", margin: "24px 0 8px", position: "relative" }}>
          <span
            style={{
              display: "inline-block",
              background: t.gradient,
              color: t.textColor,
              padding: "14px 38px",
              borderRadius: 30,
              fontWeight: 700,
              fontSize: 15,
              boxShadow: `0 10px 24px ${t.accent}55`,
            }}
          >
            RSVP Now →
          </span>
        </div>

        <div
          style={{
            textAlign: "center",
            margin: "22px 0 0",
            borderTop: `1px solid ${t.accent}55`,
            paddingTop: 16,
            position: "relative",
          }}
        >
          <p style={{ fontSize: 13, color: "#333", margin: "0 0 6px", lineHeight: 1.5, fontWeight: 600 }}>
            ✨ Crafted with <strong style={{ color: t.accent }}>Cake AI Artist</strong>
          </p>
          <p style={{ fontSize: 12, color: "#444", margin: 0 }}>
            Design your own AI cake & invite at <strong style={{ color: t.accent }}>cakeaiartist.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
