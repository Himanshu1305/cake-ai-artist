## 1. AI-generated vendor messages (editable per vendor)

**Today**: `send-vendor-email` builds one canned template at send-time. There's no per-vendor AI draft visible in the UI; users can only "Copy message" of a templated string.

**Fix**:
- Add a **"✨ Generate AI message"** button inside each task's vendor panel. It calls a new edge function `generate-vendor-message` which uses Lovable AI (`google/gemini-2.5-flash`) with a prompt built from: party (theme, occasion, date, venue, city, guests, host name/contact), task (title, description, category), and vendor (name, role inferred from category).
- Returned text is loaded into a new editable `vendor_message` field (multi-line `<Textarea>`) shown above the Email/WhatsApp/Copy buttons. User can edit freely; we save on blur.
- "Email vendor" and "WhatsApp" actions now use `vendor_message` if present (fallback: existing template). Pass `customMessage` to `send-vendor-email` from this field.
- "Regenerate" button to get a new variation.

**Schema**: add `vendor_message text` to `party_tasks` (nullable). No breaking change.

**Edge function** `generate-vendor-message`: validates JWT + party ownership, calls AI gateway, returns `{ message }`. ~60 lines.

## 2. Smarter default checklist tasks

**Fix the concierge prompt** in `party-planner-chat/index.ts`:
- Expand task category enum to include `photography`, `entertainment`, `transport`, `gifts`.
- Update `SYSTEM_PROMPT` to mandate a baseline set whenever building a plan: **Cake, Decor, Catering/Food, Photographer/Videographer, Entertainment (host/DJ/games), Invitations, Return gifts/favors, Venue logistics, Day-of coordinator**. Drop generic filler like "make a playlist", "buy thank-you cards", "sleep early" that have been showing up.
- Each task description must include the *kind of vendor to contact* (e.g. "Local baker", "Event photographer", "Magician / face-painter", "Decorator") so the vendor panel pre-fills `vendor_notes`.
- Pre-fill `vendor_notes` on insert from the `description` so users see the vendor type immediately.

No DB change needed beyond #1.

## 3. Visually rich, on-theme invitation

The current invite has a colorful hero but a plain white body and a tiny logo at the bottom. For themes without `artwork` (Unicorn, Barbie, etc.) the hero is just emojis + a flat gradient — too sparse.

**InvitePreview.tsx + send-party-invite/index.ts changes** (kept in lockstep so app preview = email):

1. **Bigger, brand-forward header**: prominent Cake AI Artist logo at the **top** of the card on a soft cream strip (height ~56px), with "Party invitation" eyebrow. Footer keeps a smaller wordmark + UTM CTAs.
2. **Richer hero**:
   - Add `heroEmojis` + `badge` + `font` + `pattern` to the themes that are missing them (Unicorn, Barbie, Frozen, Princess, Mermaid, Dinosaur, Pokemon, Harry Potter, Black & Gold, Carnival, Tropical, Bluey, Peppa, Paw Patrol, Cocomelon, Floral, Boho, Hot Wheels, Sports, Disco, Retro 90s, Star Wars, Spider-Man, Wonder Woman, Construction, Jungle, Garden Tea Party, Pastel Minimal, Taylor Swift).
   - Hero gets larger emoji row (size 44–56), themed font for the headline, and a CSS-pattern overlay (sparkles/dots/stripes per theme) on top of the gradient so it never looks flat.
   - For top 4 themes (Unicorn, Barbie, Princess, Frozen, Spider-Man) add lightweight generated artwork (call AI image gen offline → store in `public/`) and reference via `artwork`.
3. **Themed body, not white**:
   - Body background switches from pure `#fff` to a tinted surface using `t.accent` at low opacity (e.g. `linear-gradient(180deg, rgba(accent,.08), #fff 200px)`).
   - Detail card (`📅 When / 📍 Where / ✨ Theme`) gets a subtle themed left border (`borderLeft: 4px solid accent`) and themed icons.
   - Section divider stripes use `t.accent`.
   - RSVP button keeps gradient but adds a soft glow shadow in `accent`.
4. **Themed corner accents**: floating emojis (CSS `position:absolute`, low opacity) in 2 corners of the body so the whole card feels themed, not just the top.
5. **Email parity**: mirror all the above in `send-party-invite/index.ts` using inline-styled HTML (no external CSS). For artwork themes, point `artwork` to `https://cakeaiartist.com/<file>.jpg` so email clients can load it.

## Files to change
- New migration: `ALTER TABLE party_tasks ADD COLUMN vendor_message text;`
- New: `supabase/functions/generate-vendor-message/index.ts`
- Edit: `supabase/functions/party-planner-chat/index.ts` (prompt + categories)
- Edit: `supabase/functions/send-vendor-email/index.ts` (use `vendor_message` when provided — already supports `customMessage`, just wire it in caller)
- Edit: `src/pages/PartyPlannerDetail.tsx` (vendor panel: add message textarea, generate button, wire to actions; insert with `vendor_notes` pre-filled)
- Edit: `src/components/InvitePreview.tsx` (top logo, body tint, accent border, corner emojis, expand `THEME_STYLES` with `heroEmojis`/`badge`/`font`/`pattern` for all themes)
- Edit: `supabase/functions/send-party-invite/index.ts` (mirror new visuals; add new theme entries)
- Generate ~5 themed hero artworks → `public/invite-<theme>.jpg`

Out of scope: per-vendor reply tracking, vendor directory.

Approve to implement.