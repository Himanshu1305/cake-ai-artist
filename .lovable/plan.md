

## Activate Occasion Reminders System

Everything is already built -- we just need to wire it up and fix a few things.

### Changes

**1. Fix email template URL**
- In `supabase/functions/send-anniversary-reminders/index.ts`, replace the placeholder `https://your-app-url.com/cake-creator` with `https://cakeaiartist.com/cake-creator`

**2. Set up the daily cron job**
- Run SQL to schedule the edge function to run daily at 9 AM UTC using `pg_cron` and `pg_net`

**3. Add to Admin dashboard monitoring**
- Add "anniversary-reminders" to the `ScheduledTasksWidget` so you can see its status and manually trigger it
- Add a "Send Test Reminder" button so you can preview the reminder email

**4. Add CRON_SECRET for security**
- Add a `CRON_SECRET` secret to prevent unauthorized calls to the function
- The cron job will include this secret in its request headers

### What Already Works (No Changes Needed)
- Edge function logic (queries occasions 7 days out, checks opt-in, deduplicates via reminder_logs)
- Database tables (reminder_logs, user_settings with anniversary_reminders column)
- Settings page toggle for users to opt in/out
- Occasion date capture in Cake Creator

