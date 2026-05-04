## Goal
Transform the invitation from a plain emoji + gradient card into a vibrant, theme-rich, welcoming invite — with smart auto-generated copy users can edit, theme-matched imagery, decorative typography, and stronger Cake AI Artist branding/traffic hooks.

## What's wrong today
- Invite header is a flat gradient with one tiny emoji (e.g., a single ⚡ for Iron Man).
- Headline + personal note placeholders are blank — users see boring defaults like "You're invited to X!".
- Branding is a single line at the bottom — no real CTA back to cakeaiartist.com.
- Same generic look across every theme.

## Changes

### 1. Theme visual overhaul (`src/components/InvitePreview.tsx` + email)
For each theme add:
- **`hero`**: a decorative banner row of 3-5 large theme emojis (e.g., Iron Man → `⚡🦾🛡️🔥💥`, Space → `🚀🌙⭐🪐👨‍🚀`, Frozen → `❄️⛄✨🏰❄️`, Unicorn → `🦄🌈✨💖⭐`). Renders big (40-52px), spaced, with subtle drop-shadow.
- **`pattern`**: a CSS background pattern (radial-gradient dots / repeating diagonal stripes / sparkle SVG) layered over the gradient for texture instead of a flat fill.
- **`badgeLabel`**: short flair text under the headline (e.g., "Suit up, hero is turning 5!", "Blast off to the party!", "A magical celebration awaits").
- **`fontImport`**: Google Fonts link for thematic display fonts (Bangers for superhero, Orbitron for space, Pacifico for unicorn/princess, Bungee for carnival, Press Start 2P for Minecraft, Cinzel for Harry Potter, etc.). Loaded once via `<link>` in the email head and via a `<style>` tag injected into the preview.
- Keep existing `gradient`, `accent`, `emoji`, `font`, `textColor`.

Header layout becomes: pattern + gradient → big emoji row → display-font headline → italic flair badge → occasion chip.

### 2. Smart suggested copy (`PartyPlannerDetail.tsx`)
Add a `getSuggestedInvite(theme, occasion, hostName, partyTitle)` helper that returns themed `{headline, message}` defaults. Examples:
- Iron Man / Avengers + Birthday → headline `"Suit up — Aarav's turning 5!"`, message `"Calling all Avengers! Join us for an action-packed celebration with cake, capes and chaos. Wear your hero best — assemble at the address below."`
- Space → `"3… 2… 1… Blast off to Aarav's birthday!"`
- Frozen → `"The ice castle gates are open — come celebrate Aarav!"`
- Princess → `"By royal decree, your presence is requested at Aarav's celebration"`
- Generic fallback per occasion (birthday/anniversary/baby shower).

Behavior:
- On invite tab load, if `inviteHeadline`/`inviteMessage` are empty, pre-fill the inputs with suggestions (state only, not yet saved) so the preview is instantly rich.
- Add a **"✨ Regenerate suggestion"** button next to each field that re-runs the helper (handy after changing theme).
- Re-run suggestions automatically when `themePick` changes *and* the user hasn't typed anything custom.

### 3. Stronger Cake AI Artist branding (preview + email)
Replace the tiny footer with a proper branded block:
- Logo image (use existing `https://cakeaiartist.com/logo.png`) at the top of the card with the host's first name (`"Aarav's family invited you via Cake AI Artist"`).
- After the RSVP button, a **"Powered by Cake AI Artist"** strip with:
  - One-line value prop: *"This invite, the cake design, and the whole party plan were created with Cake AI Artist — AI that designs personalised cakes, party packs and full celebrations in minutes."*
  - Two CTAs: **"🎂 Design your own cake"** → `https://cakeaiartist.com/?ref=invite` and **"🎉 Plan your party free"** → `https://cakeaiartist.com/party-planner?ref=invite`.
  - Tiny social proof line: *"Loved by 10,000+ celebrators worldwide"*.
- Use a `?ref=invite&theme={theme}` UTM-style query so we can later track invite-driven traffic.

### 4. Email parity (`supabase/functions/send-party-invite/index.ts`)
Mirror the new `THEME_STYLES` (gradient, hero emoji row, pattern CSS, font Google Fonts URL, badgeLabel) into the edge function's local map. Update `inviteEmail()` HTML to render:
- `<link href="https://fonts.googleapis.com/css2?...&display=swap" rel="stylesheet">` per theme.
- Hero emoji row + display-font headline + flair badge.
- The new branded footer block with two CTA buttons.
Keep email-safe inline CSS (no external CSS files; backgrounds + patterns inline; safe fallbacks on textColor).

### 5. Quick polish
- Fix the harmless "can't access property 'features', e is undefined" runtime error if it traces to the invite tab (likely `party` being null on first render of preview — guard the new render with `if (!party) return null` inside `InvitePreview`).
- Keep `TRENDING_THEMES` in sync with theme keys.

## Files touched
- `src/components/InvitePreview.tsx` (major rewrite of theme map + render)
- `src/pages/PartyPlannerDetail.tsx` (suggestion helper, prefill, regenerate buttons)
- `supabase/functions/send-party-invite/index.ts` (mirror theme styles + new HTML)

No DB migration needed — `invite_headline` / `invite_message` columns already exist.
