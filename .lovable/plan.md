## Party Planner — Editable Title, More Themes, Invite Preview

### 1. Expand the theme list
Add more trending themes to `TRENDING_THEMES` in `src/pages/PartyPlannerDetail.tsx`. New additions (~25 total):
- Space / Astronaut, Iron Man / Avengers, Frozen / Elsa, Peppa Pig, Paw Patrol, Dinosaur / Jurassic, Mermaid / Under the Sea, Construction / Trucks, Jungle Safari, Pokemon, Minecraft, Star Wars, Princess / Royal, Garden Tea Party, Carnival / Circus, Wonder Woman, Hot Wheels.
Keep "Custom" pinned at the bottom. Auto-match still works on save.

### 2. Editable Party Title
Currently `party.title` only shows as a static `<h1>`. Change in `PartyPlannerDetail.tsx`:
- Add `partyTitle` state hydrated from `party.title`.
- In the **Event Details** card, add a "Party Name" input at the top of the form (above Date row).
- Save it via the existing `saveDetails` mutation (`title: partyTitle.trim()`).
- The header `<h1>` keeps reading from `party.title`, so it updates after save.
- Keep title required (don't allow saving empty).

### 3. Invite Preview & Edit tab
Add a new **🎟️ Invite** tab (5 tabs total) in `PartyPlannerDetail.tsx`.

**What it shows:**
- A live, themed visual preview of the invitation card the guest will receive — built with React (same HTML structure & styling as the email so what you see = what gets sent).
- Editable fields beneath/beside the preview:
  - Custom invite headline (e.g. *"You're invited to Aarav's Space Adventure!"*) — defaults to `"You're invited to {title}"`.
  - Custom invite message / personal note (textarea) — free text shown above the event details block.
  - Toggle: include cake image (uses `party.cake_image_id` if present).
- "Save invite" button persists changes.

**Theme-aware styling:**
- Build a small `THEME_STYLES` map keyed by theme name → `{ gradient, accentColor, emoji, fontFamily }`. Examples:
  - Space → deep navy/purple gradient, ⭐🚀, silver accent.
  - Iron Man → red/gold gradient, ⚡, bold serif.
  - Barbie Pink → hot pink gradient, 💖.
  - Frozen → ice blue/white gradient, ❄️.
  - Default → existing pink/purple gradient, 🎉.
- Preview card uses these tokens. The `send-party-invite` Edge Function reads the same theme key and renders matching inline CSS so the email looks identical.

**Database:**
Add two nullable columns to `parties`:
```sql
ALTER TABLE parties ADD COLUMN invite_headline text;
ALTER TABLE parties ADD COLUMN invite_message text;
```
Both optional — fall back to defaults when null.

### Files to change
- `src/pages/PartyPlannerDetail.tsx` — expanded theme list, editable title field, new Invite tab with preview component, save logic.
- `src/components/InvitePreview.tsx` *(new)* — reusable themed card component with `THEME_STYLES` map (also exports the styles map).
- `supabase/functions/send-party-invite/index.ts` — import the same theme styles, use `invite_headline` / `invite_message` overrides, render themed gradient/emoji/accent in the email HTML.
- **Migration** — add `invite_headline` and `invite_message` columns to `parties`.

### Out of scope
- Per-theme custom fonts in email (web-safe fallbacks only — Gmail strips custom fonts anyway).
- Image uploads for the invite background (theme gradient is enough for v1).
