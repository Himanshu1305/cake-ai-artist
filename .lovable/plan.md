# Add `reengagement_emails` toggle

## Goal

Stop conflating promotional marketing with re-engagement. Add a new per-user preference `reengagement_emails` (default **on**), independent of `marketing_emails`. The two manual engagement campaigns ("Recent Visitors – No Cake Yet" and "We Miss You") will be sent if **either** flag is on. Other marketing-only flows (weekly upgrade nudge, blog promotion, etc.) keep using `marketing_emails` only.

## Behavior summary

| Email type | Filter |
|---|---|
| Recent Visitors – No Cake Yet (manual) | `marketing_emails = true` **OR** `reengagement_emails = true` |
| We Miss You – 30+ days inactive (manual) | `marketing_emails = true` **OR** `reengagement_emails = true` |
| Weekly upgrade nudge | `marketing_emails = true` (unchanged) |
| Blog digest | `blog_digest_emails = true` (unchanged) |
| Anniversary/birthday reminders | their own flags (unchanged) |
| Welcome / receipts / RSVP | transactional, no flag (unchanged) |

Effect on current data: 6 of the 9 "We Miss You" eligible users who had `marketing_emails = false` would have received the email on the next run, because the new `reengagement_emails` defaults to true.

## Changes

### 1. Database (migration)
- `ALTER TABLE public.user_settings ADD COLUMN reengagement_emails boolean NOT NULL DEFAULT true;`
- Backfill: existing rows get `true` automatically via the default. No other backfill needed.
- No RLS changes (existing user/admin policies already cover the column).

### 2. Edge function `send-engagement-drip`
- Replace the `marketing_emails = true` filter with `marketing_emails.eq.true,reengagement_emails.eq.true` (Supabase `.or(...)` syntax) for both `recent_visitors` and `we_miss_you` branches.
- All other logic (one-time dedupe via `engagement_email_logs`, 7-day / 30-day windows, random variant for We Miss You, `scheduled_task_runs` logging) stays identical.

### 3. Settings page (`src/pages/Settings.tsx`)
- Add a new toggle row "Re-engagement emails" with help text:
  > Occasional emails when you haven't visited in a while or started a design but didn't finish. Separate from promotional emails.
- Wire it to `user_settings.reengagement_emails` using the same pattern as the existing `marketing_emails` switch.
- Order in UI: marketing_emails, **reengagement_emails (new)**, blog_digest_emails, anniversary/birthday reminders.

### 4. Types
- `src/integrations/supabase/types.ts` regenerates automatically after the migration — no manual edit.

## Out of scope
- No changes to dedupe logic; clicking Run Now twice still sends 0.
- No automation; both campaigns remain manual-only.
- No change to weekly upgrade nudge / blog / anniversary flows.
- No "test account" concept — all filtering remains behavior + consent based.

## Files touched
- New migration (adds column).
- `supabase/functions/send-engagement-drip/index.ts` — filter change in two places.
- `src/pages/Settings.tsx` — one new toggle row.
