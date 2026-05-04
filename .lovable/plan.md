## Issue 1 — Theme defaults to "Custom (Spiritual/ISKCON)" instead of the saved theme

### Root cause
In `PartyPlannerDetail.tsx` the theme-matching logic does:
```ts
const match = TRENDING_THEMES.find((t) => t.toLowerCase() === p.theme.toLowerCase());
if (match) setThemePick(match);
else { setThemePick("Custom"); setCustomTheme(p.theme); }
```
This is exact-match only. So a saved theme like `"ISKCON"`, `"Spiritual"`, `"Iron Man"`, or any earlier free-text gets pushed into the **Custom** bucket instead of mapping to the proper trending entry. The invite preview then uses that custom string and the live preview/email don't update when the user changes the dropdown because `currentInviteTheme` is computed from stale form state and the `<InvitePreview>` doesn't remount on theme change.

A second smaller bug: `currentInviteTheme` resolves to `customTheme` whenever `themePick === "Custom"`, even if `customTheme` is an empty string — masking the actual saved `party.theme`.

### Fix
1. Add a fuzzy normalizer `matchTrendingTheme(raw)` that maps common aliases (iron/avenger/superhero → "Iron Man / Avengers", iskcon/spiritual/krishna → "Spiritual / ISKCON", space/astronaut/galaxy → "Space / Astronaut", barbie, frozen, etc.) to a canonical entry from `TRENDING_THEMES`. Reuse the same map already in `InvitePreview.getThemeStyle`.
2. In `loadAll()`, set `themePick` from this normalizer; only fall back to "Custom" when truly nothing matches.
3. Fix `currentInviteTheme` to:
   ```ts
   const currentInviteTheme =
     themePick === "Custom" ? (customTheme.trim() || party.theme)
     : (themePick || party.theme);
   ```
4. Force the live `<InvitePreview>` to re-render when theme/headline/message change by adding `key={currentInviteTheme + inviteHeadline}`.
5. When the user picks a different theme from the dropdown, auto-refresh the suggested headline & message (only if the user hasn't manually edited them — track an `inviteEditedByUser` flag).

## Issue 2 — Vendor tracking & email-to-vendor on each checklist task

You're right, this is a great upgrade. Vendor info per task gives users certainty about who is handling each activity, and lets them email vendors directly from the app. Plan:

### Schema (migration)
Add columns to `party_tasks`:
- `vendor_name text`
- `vendor_email text`
- `vendor_phone text`
- `vendor_notes text`
- `vendor_contacted_at timestamptz`
- `vendor_status text` default `'not_contacted'` — values: `not_contacted | contacted | confirmed | declined`

(All nullable, no breaking changes.)

### UI changes (`PartyPlannerDetail.tsx` → Checklist tab)
Each task row gets a collapsible **"Vendor & details"** panel:
- Inputs: Vendor name, Email, Phone (tel link), Notes
- Status dropdown (Not contacted / Contacted / Confirmed / Declined) with colored badge
- **"📧 Email vendor"** button — opens a pre-filled message and sends via the new edge function
- **"💬 WhatsApp"** button — `https://wa.me/<phone>?text=...` with same pre-filled body
- **"📋 Copy message"** button
- Auto-saves on blur

Visual: vendor info collapses by default; show a small chip on the task row when a vendor is filled in (e.g. `🧑‍🍳 Sweet Bakers — confirmed`).

### Edge function `send-vendor-email`
- Auth: validate JWT, verify task belongs to a party owned by the user.
- Input: `{ taskId }`.
- Loads task + party, builds a friendly email containing: greeting, event date/time, venue, guest count, theme, what's needed (task title + description), host's contact email + phone.
- Sends via Resend (`RESEND_API_KEY` already configured) from `noreply@cakeaiartist.com`, reply-to set to host's contact email.
- Updates `vendor_contacted_at = now()` and `vendor_status = 'contacted'`.
- Returns `{ ok: true }`.

### Concierge improvement
Update `party-planner-chat` system prompt so when it builds the plan it also suggests sensible vendor categories per task (e.g. cake → "Local baker", decor → "Decorator", food → "Caterer"). Pre-fill `vendor_notes` with what to ask for. (No schema impact beyond the new columns.)

## Files to change
- `supabase/migrations/<new>.sql` — add vendor columns to `party_tasks`.
- `src/components/InvitePreview.tsx` — export the normalizer (or duplicate map in detail page).
- `src/pages/PartyPlannerDetail.tsx` — fuzzy theme match, fix `currentInviteTheme`, key the preview, auto-refresh suggestion on theme change, expand checklist row with vendor panel + send/whatsapp/copy actions, save handlers.
- `supabase/functions/send-vendor-email/index.ts` — new edge function.
- `supabase/functions/party-planner-chat/index.ts` — small prompt tweak to recommend vendor categories.

## Out of scope (for later)
- A curated vendor directory by city/category — deferred until you have a vendor list. The schema we add today is forward-compatible: a future `vendors` table can be referenced by an optional `vendor_id` column.

Ready to implement on approval.