## 1. Remove unnecessary checklist tasks

**Drop entirely** from the concierge plan: `Assign roles`, `Food finalization`, `Confirm vendors`. These are either redundant with the per-task vendor panel (which already tracks "confirmed/contacted") or too vague to act on.

- Update `supabase/functions/party-planner-chat/index.ts`:
  - In `SYSTEM_PROMPT`, add an explicit "DO NOT generate" list: `Assign roles`, `Food finalization`, `Confirm vendors`, `Make a playlist`, `Buy thank-you cards`, `Rest the night before`.
  - Also tighten the existing "DO NOT add fluffy filler" line to mention these by name.
- Add a small server-side filter when inserting tasks: drop any task whose lowercased title matches the blocklist, so even if the model slips them in they never reach the DB.
- One-off DB cleanup: delete existing rows in `party_tasks` for the current/all parties whose title matches the blocklist (case-insensitive). Done via the data-insert tool with a `DELETE`.

## 2. "Show more" group for secondary checklist items

Tasks that should remain available but be tucked under a collapsible: **Seating arrangements, Activity planning, Party Day Setup, Day-of Schedule, Venue Walkthrough**.

- Concierge prompt: keep generating these (they're useful), but mark them as "secondary". Easiest signal: assign them `category: "day-of"` or `category: "logistics"` consistently and add a hint in the prompt that these specific titles must use those categories.
- UI in `src/pages/PartyPlannerDetail.tsx` checklist tab:
  - Split tasks into `primaryTasks` and `secondaryTasks` using a title-match list (Seating arrangements, Activity planning, Party Day Setup, Day-of Schedule, Venue Walkthrough — case-insensitive substring match, so AI variations like "Day-of schedule & timeline" still group correctly).
  - Render primary tasks as today.
  - Wrap secondary tasks in a single `<Collapsible>` with trigger label "Show {n} more day-of tasks ▾" and a count badge for completed/total.
  - Keep the same vendor panel inside each collapsed item.

## 3. Stop ISKCON copy from leaking into other themes

Two leak sources today:

a. **Saved invite text persists across theme changes.** If a user picked Spiritual / ISKCON earlier and saved the invite, then switched theme to e.g. Unicorn, the saved `invite_headline` / `invite_message` still mention "blessings", "spiritual", etc.
  - In `loadAll()` (PartyPlannerDetail.tsx), detect mismatch: if the saved invite text contains keywords from a theme that doesn't match the current theme (`blessing`, `spiritual`, `iskcon`, `aarti`, `krishna`, `puja`), discard it and use the freshly-suggested copy for the current theme. Mark `inviteEdited=false` so future theme changes also refresh.
  - When the theme changes via the Select, also blank out `inviteEdited` if the current text equals a previous suggestion (already handled), and additionally **clear** the saved DB fields silently to prevent re-leak on reload — only when the new copy is auto-generated, not when user typed.

b. **Generic fallback / placeholders use spiritual phrasing for unknown themes.** Audit:
  - `INVITE_COPY` "Spiritual / ISKCON" stays (only used when theme actually matches).
  - `getSuggestedInvite` fallback already neutral — keep.
  - **Placeholders** in input fields (`placeholder="..."`) are currently fine ("e.g. Aarav's 5th Birthday Bash", "Mumbai", etc.) — leave alone.
  - `vendor_notes` placeholder "asked for 2kg chocolate cake with photo print" — leave (generic).
  - The vendor panel `vendor_message` placeholder is generic — leave.

c. **Defensive default for "Custom" theme.** When the user's saved theme is "Spiritual / ISKCON" via the dropdown, all good. But for free-text custom themes that don't match any keyword, the fallback in `getSuggestedInvite` is the neutral "You're invited to {title}!" line. Keep this as-is — confirm by scanning once more.

## Technical change list

| File | Change |
|------|--------|
| `supabase/functions/party-planner-chat/index.ts` | Add explicit DO-NOT-GENERATE blocklist in `SYSTEM_PROMPT`; add blocklist filter before `INSERT` into `party_tasks`; mark Seating/Activity/Day-of titles as `category: "day-of"`. |
| `src/pages/PartyPlannerDetail.tsx` | Split tasks into primary + secondary; wrap secondary in `Collapsible` "Show more"; in `loadAll`, detect spiritual-keyword leak in saved invite text and replace with fresh suggestion when theme no longer matches. |
| Migration / data op | One-off: `DELETE FROM party_tasks WHERE lower(title) IN ('assign roles','food finalization','confirm vendors')`. Done as a data update (insert tool), not a schema migration. |

## Out of scope
- No DB schema changes.
- Vendor message generator and invite preview visuals untouched.
- The browser-extension `UNHANDLED_PROMISE_REJECTION` ("can't access property 'features'") is from a Firefox extension (`moz-extension://...`), not our app — ignored.

Approve to implement.