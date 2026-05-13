## Goal

Scrap the day-2 / day-7 / day-14 automatic drip. Replace it with **two manual-only** email campaigns, each triggered by its own Run Now button in the admin Scheduled Tasks widget. Nothing sends automatically.

## The two campaigns

**Campaign A — "Recent Visitor, No Cake Yet"**
- Eligibility: user has at least one `page_visits` row in the last 7 days (including today) AND has zero rows in `generated_images` ever.
- Audience: all users regardless of plan (free + premium).
- Content: reuse the existing finalized Day-2 email (subject + `day2Email()` body + `day2Layout`), unchanged.

**Campaign B — "We Miss You"**
- Eligibility: user's most recent `page_visits` row is **30+ days ago** (and they have at least one historical visit). Includes both users who created cakes and users who didn't.
- Audience: all users regardless of plan.
- Content: brand-new email using the **same Day-2 template** (`day2Layout` — cream header, gold accent bar, ⭐ rating chip, blue links, gold CTA button). Three body variants picked at random per recipient so re-runs over time feel fresh:
  1. **Warm + features recap** — "We've missed you. Here's what's new since you were last here…" lists Free Cake Designer, Community Gallery, Party Pack Generator, Blog.
  2. **Single big idea** — "Whose birthday or anniversary is coming up? Design a cake in 30 seconds."
  3. **Gift framing** — "A free design idea waiting for you 🎁" — invites them back to try one cake on us.
- Subject also rotates with the variant (e.g. "We miss you at Cake AI Artist 💛", "Your next cake idea is one click away ✨", "A little gift waiting for you 🎁").

## Duplicate prevention

One-time per user per campaign. Reuse the existing `engagement_email_logs` table with two new `email_type` values:
- `recent_visitor_no_cake`
- `we_miss_you`

Before sending to a user, check `engagement_email_logs` for that `(user_id, email_type)` — skip if present. After a successful send, insert a log row. This means clicking Run Now twice is safe — second click sends 0.

## Admin UI changes (`ScheduledTasksWidget.tsx`)

- Remove the `engagement-drip` card and its day2/day7/day14 test buttons.
- Add two new cards: "Recent Visitors – No Cake" and "We Miss You (30+ days inactive)". Each card shows:
  - Description, last run summary, and a single **Run Now** button.
  - No "next scheduled run" line (manual only) — replace with a "Manual only — does not run automatically" badge.
- Keep all other tasks (welcome, blog digest, anniversary reminders, weekly upgrade nudge) untouched.

## Edge function changes

Rewrite `supabase/functions/send-engagement-drip/index.ts` into a single function that accepts a `campaign` body param: `"recent_visitors"` or `"we_miss_you"`. Behavior:

- Auth: keep existing CRON_SECRET / JWT check.
- Branch on `campaign`:
  - `recent_visitors`: query distinct `user_id` from `page_visits` where `visited_at >= now() - 7 days`; filter out users present in `generated_images`; filter out opt-outs (`user_settings.marketing_emails = false`); filter out anyone already logged with `email_type = 'recent_visitor_no_cake'`; send Day-2 email.
  - `we_miss_you`: for each profile, find max `visited_at` from `page_visits`; keep users whose max is `<= now() - 30 days`; same opt-out + dedupe filters with `email_type = 'we_miss_you'`; pick variant `Math.floor(Math.random()*3)`; send corresponding subject + body.
- Log into `scheduled_task_runs` with `task_name` = `engagement-recent-visitors` or `engagement-we-miss-you` so the two cards have independent "Last Run" history.
- Return `{ sent, failed, skipped, message, records_processed: sent }`.
- Delete the old `day2_welcome` / `day7_trends` / `day14_final` switch and the unused `day7Email` / `day14Email` template functions.

## Cron / automation

Disable any existing `pg_cron` schedule that calls `send-engagement-drip`. Concretely: list `cron.job` rows, then `cron.unschedule(...)` the engagement-drip job. (Will be done via the insert tool since cron.* contains project-specific URLs.) After this change there is **no** automated trigger for engagement emails.

## Files touched

- `supabase/functions/send-engagement-drip/index.ts` — rewrite.
- `src/components/ScheduledTasksWidget.tsx` — replace one card with two; wire new `campaign` param into `supabase.functions.invoke('send-engagement-drip', { body: { campaign: '…' } })`.
- DB: unschedule cron job (no schema change). `engagement_email_logs` already supports the two new `email_type` strings — no migration needed.

## Out of scope

- No new tables, no schema migration.
- No changes to welcome / blog / anniversary / weekly-upgrade flows.
- No automation; emails only ever go out when you click Run Now.
