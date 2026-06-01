
# Party Planner — Tier 1 Improvements (excluding WhatsApp/SMS)

Ship 4 upgrades that close the biggest gaps vs Partiful / Evite / RSVPify without new infra dependencies.

## 1. Rich public event page at `/party/:public_slug`

A new public route guests land on when they get the invite link. Read-only, no auth required.

**Layout (mobile-first, 484px target):**
- Hero with `invite_artwork_url` (or themed fallback)
- Countdown to `event_date` (reuses `useCountdown`)
- `invite_headline` + `invite_message`
- Date · time · timezone · venue · city (with "Open in Maps" link)
- Host contact (email/phone) — only if filled
- "Who's coming" — list of guests with `rsvp_status='yes'` (first name only)
- RSVP CTA → links to existing `/rsvp/:token` (each guest's invite email already carries their token)
- "Add to Calendar" button (.ics download — see #4)
- Footer: subtle "Powered by Cake AI Artist" with link to home

**Data**: `parties` already has `Public can view by slug` SELECT policy. `party_guests` needs a read-by-slug path for the "Who's coming" list. Add a SECURITY DEFINER RPC `get_party_public(p_slug text)` that returns party fields + an array of confirmed guest first-names. Avoids opening guest table to anon.

**Files**: `src/pages/PublicParty.tsx` (new), route added in `src/App.tsx`. SQL migration for the RPC.

## 2. Per-line-item budget tracking

Turn `parties.budget` (single number) into a real tracker driven by tasks.

**Schema**: add to `party_tasks`:
- `estimated_cost numeric`
- `actual_cost numeric`
- `currency text` (inherits from party — default INR/USD by host's profile country)

**UI**: new "💰 Budget" tab on `PartyPlannerDetail.tsx` (6th tab):
- Total budget input (existing `parties.budget`)
- Per-task estimate + actual inline-edit table grouped by category
- Summary card: Planned vs Spent, % of budget, remaining, over-budget badge
- Per-category bar chart (simple CSS bars, no chart lib)

**AI concierge**: extend `build_party_plan` tool schema with optional `estimated_cost` per task. Update system prompt to fill estimates based on `city` + `guest_count`. Existing tasks without estimates stay editable.

**Files**: migration, `PartyPlannerDetail.tsx` (new tab), `supabase/functions/party-planner-chat/index.ts` (tool schema + prompt).

## 3. RSVP upgrades

**Schema additions to `party_guests`:**
- `plus_one_names jsonb` (array of strings)
- `meal_preference text` (free text — "vegetarian", "vegan", "no nuts")
- `custom_answers jsonb` (answers to host's custom questions)

**Schema additions to `parties`:**
- `rsvp_deadline date`
- `custom_questions jsonb` — array of `{ id, question, type: 'text' | 'choice', options? }`

**Host UI** (Invites tab on `PartyPlannerDetail.tsx`):
- New "RSVP form settings" collapsible: deadline picker, toggle meal preference, add/remove up to 3 custom questions
- Guest list shows meal preferences inline + plus-one names
- "Send reminder to non-responders" button — calls existing `send-party-invite` with a different template for guests where `responded_at IS NULL` and `invited_at IS NOT NULL`

**Guest UI** (`src/pages/PartyRSVP.tsx`):
- If status=yes and plus_ones>0, prompt for each plus-one's name
- Meal preference field if enabled
- Render custom questions
- Show RSVP deadline + "respond by" copy

**Files**: migration, `PartyPlannerDetail.tsx` (Invites tab additions), `PartyRSVP.tsx`, `send-party-invite/index.ts` (reminder template branch).

## 4. Add-to-Calendar (.ics)

Client-side generated, no backend. Used in two places:
- Public event page (#1)
- RSVP confirmation page after guest says "yes"

**Util**: `src/utils/icsCalendar.ts` — builds a minimal VCALENDAR string from party fields and triggers download. No deps.

## Non-goals (explicit)

- WhatsApp / SMS distribution — deferred per user request
- Co-host collaboration
- Vendor marketplace
- Photo memory wall / post-event loop
- Quick-start templates

## File list

- `supabase/migrations/<timestamp>_party_planner_tier1.sql` — new columns, RPC
- `src/pages/PublicParty.tsx` — new public event page
- `src/App.tsx` — register `/party/:slug` route
- `src/utils/icsCalendar.ts` — .ics builder
- `src/pages/PartyPlannerDetail.tsx` — Budget tab + RSVP settings UI + reminder button
- `src/pages/PartyRSVP.tsx` — plus-one names, meal, custom Qs, .ics button
- `supabase/functions/party-planner-chat/index.ts` — estimated_cost on tool schema
- `supabase/functions/send-party-invite/index.ts` — reminder template branch

## Order of build

1. Migration first (schema unlocks everything)
2. Public event page + .ics (highest visible impact)
3. RSVP upgrades (host UI then guest UI)
4. Budget tab + AI concierge estimates
