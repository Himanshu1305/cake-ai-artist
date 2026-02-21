

## Weekly Upgrade Reminder Email for Free Users

### What We'll Build
A new automated weekly email sent every Monday at 10 AM UTC to all free (non-premium) users who haven't opted out of marketing emails. The email will highlight premium benefits, showcase a recent blog post or cake design tip, and include a strong call-to-action to upgrade.

### Why a New Function (Not Reusing Existing Ones)
- `send-conversion-email` uses Brevo and is designed for one-time admin-triggered blasts -- not suitable for automated weekly scheduling
- `send-weekly-blog-digest` targets blog subscribers (a different audience) and focuses on blog content
- A dedicated function keeps concerns separate and allows independent scheduling, monitoring, and opt-out logic

### Plan

**1. Create new edge function: `send-weekly-upgrade-nudge`**
- Uses Brevo (same as conversion email) for delivery
- Queries all free users from `profiles` where `is_premium = false` or `is_premium IS NULL`
- Checks `user_settings.marketing_emails` to respect opt-outs
- Tracks sends in a new `upgrade_nudge_logs` table to avoid sending duplicates in the same week
- Logs runs to `scheduled_task_runs` for admin monitoring
- Rotates through 4 different email templates weekly (so users don't get the same email every week):
  - Week 1: "Feature Spotlight" -- highlights Party Pack Generator
  - Week 2: "By the Numbers" -- shows what premium users create (150 vs 5 generations)
  - Week 3: "Success Stories" -- social proof and user testimonials
  - Week 4: "Limited Time" -- urgency-based with lifetime deal pricing
- Each email includes an unsubscribe link that toggles `marketing_emails` off

**2. Create database table: `upgrade_nudge_logs`**
- Columns: `id`, `user_id`, `template_variant` (1-4), `sent_at`, `week_number` (ISO week)
- RLS: service role can manage, users can view their own
- Prevents duplicate sends within the same ISO week

**3. Schedule daily cron job**
- Runs every Monday at 10:00 AM UTC via `pg_cron`
- Uses `CRON_SECRET` header for security (same pattern as anniversary reminders)
- Also supports manual admin trigger via JWT auth

**4. Add to Admin dashboard**
- Add "Weekly Upgrade Nudge" to `ScheduledTasksWidget`
- Include "Run Now" and "Test Email" buttons
- Show which template variant will be used next

**5. Add `send-weekly-upgrade-nudge` to `config.toml`**
- Set `verify_jwt = false` (uses CRON_SECRET + JWT dual auth like anniversary reminders)

### Email Design
- Matches existing brand style (purple/pink gradient header, logo, same footer)
- Mobile-responsive HTML tables
- Clear CTA button linking to `https://cakeaiartist.com/pricing`
- Footer with unsubscribe link and company info

### Technical Details

```text
Edge Function Flow:
  
  Request (cron or admin)
       |
  Auth check (CRON_SECRET or JWT)
       |
  Query free users from profiles
       |
  Filter out marketing_emails = false
       |
  Check upgrade_nudge_logs for this week
       |
  Determine template variant (week_number % 4)
       |
  Send via Brevo API
       |
  Log to upgrade_nudge_logs + scheduled_task_runs
```

### No New Secrets Needed
- `BREVO_API_KEY` -- already configured
- `CRON_SECRET` -- already configured
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` -- already available

### Files to Create/Modify
- **New**: `supabase/functions/send-weekly-upgrade-nudge/index.ts`
- **New**: Database migration for `upgrade_nudge_logs` table
- **Modify**: `src/components/ScheduledTasksWidget.tsx` (add new task entry)
- **Config**: `supabase/config.toml` (add function config -- auto-managed)
- **New**: Cron job via SQL insert
