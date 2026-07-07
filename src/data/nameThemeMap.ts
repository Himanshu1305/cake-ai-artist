// Curated cake themes per name. Each name gets 4 theme slugs from CAKE_THEMES.
// Falls back to origin/gender heuristics for names without an explicit entry —
// so all ~200 name pages render a relevant, non-random theme grid.

import type { NameEntry } from "./cakeNames";
import type { NameMeaning } from "./nameMeanings";
import { CAKE_THEMES } from "./cakeThemes";

const validThemeSlugs = new Set(CAKE_THEMES.map((t) => t.slug));

// Explicit overrides for names where the vibe is unmistakable.
// Keep the list short — everything else is handled by the heuristic below.
const EXPLICIT: Record<string, string[]> = {
  // Indian
  aarav: ["superhero", "football", "cricket", "space"],
  arjun: ["cricket", "superhero", "harry-potter", "gamer"],
  krishna: ["floral", "music", "elegant", "gold"],
  aditya: ["space", "superhero", "gamer", "gold"],
  diya: ["floral", "elegant", "gold", "princess"],
  aadhya: ["princess", "unicorn", "floral", "fairy"],
  saanvi: ["princess", "unicorn", "floral", "fairy"],
  // Muslim / Arabic — lean elegant + Islamic-friendly non-figurative themes
  muhammad: ["gold", "elegant", "football", "gamer"],
  fatima: ["floral", "elegant", "gold", "watercolour"],
  layla: ["space", "elegant", "floral", "gold"],
  noor: ["gold", "elegant", "watercolour", "floral"],
  yasmin: ["floral", "elegant", "watercolour", "tropical"],
  zayn: ["music", "elegant", "gold", "gamer"],
  // Hispanic
  santiago: ["football", "superhero", "gamer", "car"],
  diego: ["football", "superhero", "car", "gamer"],
  valentina: ["princess", "unicorn", "floral", "barbie"],
  lucia: ["princess", "floral", "elegant", "fairy"],
  camila: ["floral", "elegant", "unicorn", "watercolour"],
  // African-American
  aaliyah: ["music", "elegant", "gold", "floral"],
  zuri: ["princess", "floral", "unicorn", "barbie"],
  kehlani: ["mermaid", "music", "watercolour", "tropical"],
  legend: ["music", "gamer", "superhero", "gold"],
  xavier: ["superhero", "space", "gamer", "harry-potter"],
  zion: ["music", "space", "gamer", "superhero"],
  // Gen Alpha trending
  luna: ["space", "unicorn", "elegant", "watercolour"],
  nova: ["space", "unicorn", "gamer", "rainbow"],
  aurora: ["princess", "space", "unicorn", "fairy"],
  atlas: ["space", "dinosaur", "superhero", "adventure" as string],
  kai: ["mermaid", "space", "gamer", "superhero"],
  river: ["mermaid", "tropical", "watercolour", "rainbow"],
  wren: ["floral", "fairy", "watercolour", "elegant"],
  sage: ["floral", "watercolour", "elegant", "vintage"],
  bodhi: ["tropical", "space", "gamer", "elegant"],
  // Western classics
  liam: ["superhero", "football", "car", "gamer"],
  noah: ["dinosaur", "construction", "rainbow", "space"],
  oliver: ["dinosaur", "construction", "vintage", "harry-potter"],
  harry: ["harry-potter", "football", "superhero", "gamer"],
  george: ["dinosaur", "construction", "vintage", "harry-potter"],
  charlotte: ["princess", "floral", "unicorn", "elegant"],
  olivia: ["floral", "unicorn", "elegant", "princess"],
  emma: ["floral", "elegant", "unicorn", "watercolour"],
  amelia: ["princess", "unicorn", "floral", "space"],
  sophia: ["princess", "floral", "unicorn", "elegant"],
  isabella: ["princess", "floral", "barbie", "elegant"],
  scarlett: ["floral", "elegant", "vintage", "princess"],
  ruby: ["floral", "vintage", "elegant", "unicorn"],
};

const GIRLY = ["unicorn", "princess", "floral", "fairy", "mermaid", "barbie", "rainbow"];
const BOYS_KID = ["superhero", "dinosaur", "car", "space", "construction", "football", "minecraft"];
const ADULT_ELEGANT = ["floral", "elegant", "gold", "watercolour", "vintage", "chocolate-drip"];
const UNISEX_KID = ["rainbow", "space", "gamer", "music", "superhero", "unicorn"];

/**
 * Returns 4 theme slugs relevant to the given name.
 * Uses explicit override first, then heuristic based on gender + origin + pairings.
 */
export const themesForName = (
  slug: string,
  meaning?: NameMeaning,
  entry?: NameEntry,
): string[] => {
  const explicit = EXPLICIT[slug];
  if (explicit) return explicit.filter((s) => validThemeSlugs.has(s)).slice(0, 4);

  // Try to seed from meaning.pairings — they already mention theme-like tokens.
  const fromPairings: string[] = [];
  if (meaning?.pairings) {
    for (const p of meaning.pairings) {
      const lower = p.toLowerCase();
      for (const slug of validThemeSlugs) {
        if (lower.includes(slug.replace(/-/g, " ")) || lower.includes(slug)) {
          if (!fromPairings.includes(slug)) fromPairings.push(slug);
        }
      }
    }
  }

  // Fill the rest from gender-based defaults.
  const gender = meaning?.gender ?? "unisex";
  const pool =
    gender === "girl"
      ? [...GIRLY, ...ADULT_ELEGANT]
      : gender === "boy"
        ? [...BOYS_KID, ...ADULT_ELEGANT]
        : UNISEX_KID;

  const combined = [...fromPairings];
  for (const slug of pool) {
    if (combined.length >= 4) break;
    if (!combined.includes(slug) && validThemeSlugs.has(slug)) combined.push(slug);
  }
  return combined.slice(0, 4);
};
