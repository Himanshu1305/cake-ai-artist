## 1. "Show more" group not visible

Current code (`PartyPlannerDetail.tsx` ~L537) only matches by **title substring** against a small list. For this party, only 2 of 12 tasks happen to match, and the trigger uses a faint `bg-muted/20 border-dashed` style that blends in. Many AI-generated titles like "Coordinate Day-of Helper" should also be secondary but aren't caught.

**Fix:**
- Detect secondary tasks by **either** `category === "day-of"` **or** the existing title list. This catches everything the concierge marks as day-of (e.g. "Coordinate Day-of Helper" already has `category: day-of`).
- Make the trigger visually obvious: replace dashed/muted style with a solid soft-tinted band (`bg-primary/5 border-primary/30`), bold label ("📅 Day-of details"), clearer "Show N more day-of tasks ▾" CTA, and `text-foreground` instead of muted.
- Show the trigger above the secondary list **only if at least 1 secondary task exists** (already correct).

## 2. Confusing vendor email subject

Currently in `send-vendor-email/index.ts` (L88):
```
Subject: ${party.title} — ${task.title} (request for quote)
```
Real-world example: `Marriage Anniversary — Order Retro 90s Cake (request for quote)` — fine, but the AI-prefixed variant the user got ("Quote Request - Retro 90s Marriage Anniversary Party") is also in `generate-vendor-message`'s output and gets used as the subject.

**Fix:**
- Standardize subject to a clear, vendor-friendly format:
  `"<Vendor task> for <event date> — quote request"`
  e.g. `"Cake order for Wed, June 10 — quote request"`
- Compute the short date in `send-vendor-email/index.ts` using `event_date` (no timezone string in subject — keep it short).
- Strip any AI-suggested subject from `generate-vendor-message` so the body only contains the message; the subject is always assembled server-side from facts.

## 3. More soothing themes for non-birthday occasions

Birthdays already have lots of pop themes. Anniversaries, weddings, baby showers, etc. need elegant/soothing options.

**Add to `TRENDING_THEMES`** (PartyPlannerDetail.tsx) and to `THEME_STYLES` (InvitePreview.tsx):
- **Romantic Rose Gold** — blush + rose-gold gradient, script font, rose petals.
- **Candlelight & Champagne** — warm cream, gold accents, serif, sparkles.
- **Vintage Sepia Romance** — sepia/cream tones, classic serif, framed look.
- **Moonlight & Stars** — deep navy + silver, soft glow, calm.
- **Ocean Breeze** — soft teal/aqua, airy serif, wave accents.
- **Lavender Fields** — pastel purple, soft sans, sprig accents.
- **Eternal Bond** (anniversary-specific) — burgundy + gold, script.
- **Soft Sunrise** (baby shower / engagement) — peach + cream gradient.

Each gets a `THEME_STYLES` entry: gradient, accent, soft `bodyTint`, calm `cornerEmojis` (🌹, 🕯️, 💍, 🌙, 🌊, 💜, etc.), script/serif font, no loud patterns.

Also: in the theme `<Select>` UI, group themes into headings — **Kids & Birthdays**, **Romantic & Anniversary**, **Elegant & Soothing**, **Spiritual**, **Custom** — using `<SelectGroup>` + `<SelectLabel>` so users browsing for an anniversary aren't drowning in Paw Patrol.

## 4. More creative, theme- and occasion-aware invite copy

Current `INVITE_COPY` only has 4 entries (Iron Man, Space, Minecraft, Spiritual). Everything else falls back to the generic "Come celebrate, laugh, and make sweet memories!" — exactly what the user saw for Retro 90s + Marriage Anniversary.

**Fix:** Expand `INVITE_COPY` to a 2-D map keyed by **theme** with **occasion-specific overrides**:

```ts
const INVITE_COPY: Record<ThemeKey, {
  default: Variant[];
  byOccasion?: Record<OccasionKey, Variant[]>;
}>;
```

Add 2 variants each for every theme listed in TRENDING_THEMES (existing + new ones from item 3). For each, also write occasion-specific overrides for the common cases:
- **Birthday** — playful, kid-energy.
- **Marriage / Wedding Anniversary** — warm, romantic, "years of love".
- **Engagement** — sparkly, "two hearts".
- **Baby Shower** — gentle, "tiny soon-to-arrive".
- **Housewarming** — cozy, "new beginnings".

Example additions:

- **Retro 90s + Marriage Anniversary**:
  Headline: "Pop in your scrunchies — we're celebrating ${years} years of cool!"
  Message: "Cassettes are rewound, the playlist is ready, and the love story is still our favorite single. Join us for a totally rad night of neon, nostalgia, cake, and the two people who proved good things never go out of style."

- **Romantic Rose Gold + Anniversary**:
  Headline: "Still each other's favorite story"
  Message: "Soft candlelight, a few familiar songs, and a table set for the people who've cheered us on. Please join us as we celebrate another beautiful chapter together."

- **Floral Garden + Baby Shower**:
  Headline: "A tiny petal is on the way 🌸"
  Message: "Sip something sweet, share a wish, and help us welcome the newest little blossom to our garden."

`getSuggestedInvite` is updated to:
1. Resolve a `ThemeKey` via the existing `matchTrendingTheme` helper (single source of truth).
2. Resolve an `OccasionKey` from `party.occasion` (lowercase contains check: "anniversary", "wedding", "engagement", "baby", "house").
3. Pick `byOccasion[occasion]` if present, else `default`.
4. Cycle by `index` so the existing "🔄 New suggestion" button keeps working.
5. Final fallback stays neutral (no spiritual leak).

Also: when the user changes theme **or** occasion and `inviteEdited === false`, auto-refresh the suggestion (occasion change is currently not a trigger).

## Files to change

| File | Change |
|---|---|
| `src/pages/PartyPlannerDetail.tsx` | Secondary detection by category+title; expand `INVITE_COPY` to theme+occasion map; add new theme entries to `TRENDING_THEMES`; group themes in Select; bolder Show-more trigger; refresh invite when occasion changes. |
| `src/components/InvitePreview.tsx` | Add `THEME_STYLES` entries for the 8 new soothing themes. |
| `supabase/functions/send-vendor-email/index.ts` | New subject format with short event date; ignore AI-suggested subject. |
| `supabase/functions/generate-vendor-message/index.ts` | Return only message body, no subject line. |

## Out of scope
- No DB schema change.
- No new edge functions.
- Email invite render already uses `THEME_STYLES`, so new themes work in invitations automatically.

Approve to implement.