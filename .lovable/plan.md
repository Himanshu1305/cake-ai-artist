## Problem

The invite hero is just a CSS gradient + a row of emoji (🕯️🥂✨, 🌹💕✨, 🫖🌷🍰, etc.). Even on the new "soothing" themes this still reads as childish/clip-art and is not directly tied to the occasion. The user wants:

- Real, occasion-appropriate imagery on the hero (not emoji rows).
- Adult occasions (anniversary, wedding, engagement, retirement, baby shower, housewarming) → elegant, photographic/illustrative, grown-up.
- Kids' birthdays → playful, but tuned to the child's age (toddler vs 7 vs teen).
- Background and decorations must visually match the occasion.

## Fix

### 1. New edge function: `generate-invite-artwork`

- Input: `partyId`, `theme`, `occasion`, `title`, optional `childAge`, optional `forceRegenerate`.
- Auth-required (JWT validated in code).
- Builds an **occasion-aware art prompt** (no people, no faces, no text in image):
  - Adult occasions → "elegant editorial still life / soft painterly background", themed to the chosen theme (e.g. *Candlelight & Champagne*: warm bokeh, two champagne flutes, candle glow, gold ribbon — photographic, tasteful, no cartoon).
  - Kids' birthday → playful illustrated scene tuned to `childAge` (1-3 = soft pastel toy motifs; 4-8 = bright cartoon theme scene; 9-12 = bolder, less babyish; 13+ = teen/aesthetic, no cutesy props).
  - Wedding/engagement → florals, rings, soft light.
  - Baby shower → muted pastel nursery still life.
  - Housewarming/retirement → warm interior, plants, soft light.
- Negative cues baked in: *no children's cartoon characters, no clip-art emoji, no text/letters, no logos, no balloons-as-faces, no chibi, no glitter overlays for adult themes*.
- Calls Lovable AI Gateway with `google/gemini-2.5-flash-image` (Nano Banana). On 429/402 returns the proper status so the client can fall back to the existing gradient+emoji hero.
- Uploads the returned base64 PNG to the existing `party-uploads` (or equivalent) public storage bucket at `invites/{partyId}.png` and returns `{ url }`.
- Saves `invite_artwork_url` on the `parties` row so it's reused across renders/emails.

### 2. DB migration

Add to `parties`:

- `invite_artwork_url text`
- `invite_artwork_meta jsonb` (stores `{ theme, occasion, childAge }` so we can detect when it's stale and auto-regenerate).
- `child_age int` (nullable) — only collected when occasion = birthday.

No RLS changes — existing party-owner policies apply.

### 3. `PartyPlannerDetail.tsx`

- In the Invite tab, when occasion is "birthday", show a small **"Child's age"** number input (1–17). Save to `parties.child_age`.
- "Regenerate suggestion" button gets a sibling **"Regenerate artwork"** button (or, simpler: the existing button regenerates **both** copy and artwork in one click — preferred so the user sees a coherent refresh). Show spinner while artwork generates.
- On first load of the Invite tab, if `invite_artwork_url` is missing OR `invite_artwork_meta` doesn't match current `(theme, occasion, child_age)`, auto-call `generate-invite-artwork`.
- Pass `artworkUrl` down to `<InvitePreview />`.

### 4. `InvitePreview.tsx`

- Add prop `artworkUrl?: string`.
- Hero rendering:
  - When `artworkUrl` is present → use it as the hero background (cover, center) with a soft gradient scrim for text legibility, and **hide the emoji row entirely**.
  - When absent (fallback) → keep existing gradient + emoji row, but for **adult occasions** (anniversary/wedding/engagement/baby shower/housewarming/retirement) render at most **2 small accent emojis** at reduced opacity instead of the current 5-emoji row, and skip the floating corner emojis. Detection uses the same `ADULT_OCC_RX` already in `PartyPlannerDetail.tsx` (lift it into a small shared util).
- Keep brand bar, copy, details card, RSVP button, footer unchanged.

### 5. `send-party-invite/index.ts`

- Read `invite_artwork_url` from the party row and use it as the hero `background-image` in the email HTML (same scrim + same suppression of emoji row when artwork exists). Same adult-occasion emoji reduction in the fallback path.

### 6. Tone guardrails (small extension)

- Extend the existing `KIDDIE_RX` leak check so that when the artwork is stale for the current occasion (meta mismatch) it also forces a regeneration, not just the copy.

## Files

| File | Change |
|---|---|
| `supabase/functions/generate-invite-artwork/index.ts` (new) | AI image generation with occasion + age aware prompt; uploads to storage; returns URL. |
| `supabase/config.toml` | Register new function. |
| Migration | Add `invite_artwork_url`, `invite_artwork_meta`, `child_age` to `parties`. |
| `src/pages/PartyPlannerDetail.tsx` | Child-age input (birthdays only), wire artwork generation, auto-regenerate on stale meta, pass `artworkUrl` to preview. |
| `src/components/InvitePreview.tsx` | New `artworkUrl` prop; use as hero bg with scrim; suppress/reduce emoji rows for adult occasions in fallback. |
| `supabase/functions/send-party-invite/index.ts` | Mirror artwork hero + adult-occasion emoji reduction in email HTML. |

## Out of scope

- No changes to themes list, RSVP flow, or copy generator (already in place).
- No on-image text rendering (text stays as HTML over the artwork for crispness and i18n).
- No per-guest personalized artwork (single artwork per party).
