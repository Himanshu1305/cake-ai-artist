## Party Planner improvements (issues 1–7)

### 1. Structured event details (date / time / location) instead of chat-only
Add an editable **"Event Details" card** at the top of `PartyPlannerDetail.tsx` (above the tabs) with:
- Date picker (shadcn `Calendar` in a `Popover`) — defaults to **today**, never 2024.
- Time picker (`<input type="time">`).
- Venue text input.
- City / location text input (used for vendor context).
- "Save" button → updates `parties` row directly.

The chat concierge will read these as already-known facts (passed in the system prompt context) and stop re-asking for them. Reuses the same date/time pattern already in Party Pack Generator for consistency.

### 2. Theme dropdown + custom override
Add a **Theme** selector in the Event Details card:
- Dropdown of ~15 currently-trending themes (e.g. *Barbie Pink, Bluey, Taylor Swift Eras, Cocomelon, Harry Potter, Floral Garden, Boho, Disco, Spider-Man, Unicorn, Pastel Minimal, Tropical Luau, Black & Gold Elegance, Retro 90s, Sports*).
- Auto-pre-select if the linked cake's theme matches one in the list.
- "Custom theme" option that reveals a free-text input (saved into `parties.theme`).

### 3. "No plan displayed" bug
**Root cause:** the model returns a friendly intro message but does **not** call the `build_party_plan` tool until it has occasion + date + guest_count. After the user-visible message, no checklist appears because no tool call happened.

**Fix:**
- Once Event Details (date, guests, theme/occasion) are filled in via the form (issue 1+2), inject them into the system prompt so the model has the minimum info immediately and triggers `build_party_plan` on the very next turn.
- Add a visible **"Generate Plan Now"** button in the chat header that forces a follow-up message like *"Build the plan now using the details above"* — guarantees the tool call fires.
- Tighten the system prompt: *"If date, guest_count, and occasion are already known from context, do NOT re-ask — call `build_party_plan` immediately."*
- After a successful plan build, auto-switch the active tab to **Checklist** so the user sees the result.

### 4. Date defaults to 2024 / time becomes 12:00 AM / RSVP shows 5:30 AM
**Root causes:**
- The chat is parsing "13-may" without a year → model defaults to 2024.
- No time was being captured (`event_date` stored at midnight UTC), and the RSVP page renders in the viewer's locale, causing the timezone shift (5:30 PM IST stored as UTC midnight → displayed as 5:30 AM in another zone).

**Fix:**
- Capture date + time explicitly via the new pickers (issue 1) — no AI parsing needed for these fields.
- Store `event_date` as a proper ISO timestamp built from the user's local date+time.
- On the RSVP page and invite email, format using the **host's timezone** (store `event_timezone` on `parties`, default to the browser tz at save time) so guests always see the time the host intended, with the timezone label appended (e.g. *"5:30 PM IST"*).

**Migration:** add `event_timezone text`, `event_time text` (or rely solely on the timestamptz + tz label), and `contact_email text`, `contact_phone text` columns to `parties` (see issue 7).

### 5. Realtime RSVP status updates
Currently the host must refresh to see RSVP changes. Add a Supabase Realtime subscription in `PartyPlannerDetail.tsx`:
- Enable realtime on `party_guests` (`ALTER PUBLICATION supabase_realtime ADD TABLE public.party_guests`).
- Subscribe to `postgres_changes` filtered by `party_id=eq.<id>` and update local `guests` state on UPDATE events.
- Show a subtle toast: *"Bobby just RSVP'd Yes 🎉"*.

### 6. Better, branded invite email
Rebuild the HTML in `send-party-invite/index.ts`:
- Add Cake AI Artist **logo** at the top (hosted PNG from `/public` or Supabase Storage).
- Warm intro paragraph: *"You've been invited to a celebration crafted with love using Cake AI Artist — the AI that designs personalised cakes, party packs, and now plans full celebrations."*
- Hero gradient banner with confetti emoji, big event title.
- Clean event detail rows (date in host tz, venue, theme).
- Two CTA buttons: **RSVP Yes** and **View Invite** (deep links pre-filling the response).
- Footer with: small "What is Cake AI Artist?" blurb (1 line), link back to `cakeaiartist.com`, and the standard powered-by line.
- Mobile-responsive (max-width 600px, large tappable buttons, system fonts).

### 7. Contact info for vendor coordination
- Add `contact_email` and `contact_phone` fields to `parties` (migration in issue 4).
- Surface them in the Event Details card (issue 1).
- Pass them into the concierge system prompt so it can suggest *"I can draft a WhatsApp message to send to caterers at +91… — want me to?"* and include them in any vendor-outreach message templates it produces.
- Add a **"Vendor Message"** quick action in the chat: generates a ready-to-copy message (with the host's name, phone, email, event date, venue, guest count) the user can paste into WhatsApp/email.

---

### Files to change
- **DB migration**: add `event_timezone`, `contact_email`, `contact_phone` to `parties`; enable realtime on `party_guests`.
- `src/pages/PartyPlannerDetail.tsx` — Event Details card, theme picker, realtime subscription, "Generate Plan Now" button, auto-switch tab on plan build.
- `src/pages/PartyRSVP.tsx` — render time in host timezone with label.
- `supabase/functions/party-planner-chat/index.ts` — tighter prompt, contact fields in context, vendor-message helper.
- `supabase/functions/send-party-invite/index.ts` — rebuilt branded HTML email with logo + app blurb + dual CTAs + host-tz formatting.
- `src/pages/PartyPlanner.tsx` — small: when creating a party, optionally seed a default date.

### Out of scope
- A full vendor directory / outbound messaging from inside the app (issue 7 stops at generating copy-ready messages; actual WhatsApp/email sending is left to the user for now).