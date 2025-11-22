# Anniversary Reminder System Setup

The reminder system has been implemented but is **NOT ENABLED** until you provide the Resend API key.

## Current Status
✅ Database tables created (`reminder_logs`, `anniversary_reminders` column in `user_settings`)  
✅ Edge function created (`send-anniversary-reminders`)  
✅ Settings page created for users to toggle reminders  
❌ Resend API key not configured (system inactive)  
❌ Cron job not enabled (won't run automatically)

## How It Works
1. Users can save occasion dates when creating cakes
2. Users can toggle anniversary reminders in Settings page
3. Edge function checks daily for occasions 7 days away
4. Sends email reminders via Resend to users who have reminders enabled
5. Logs sent reminders to prevent duplicates

## To Enable the System

### Step 1: Get Resend API Key
1. Sign up at https://resend.com
2. Verify your domain at https://resend.com/domains
3. Create an API key at https://resend.com/api-keys

### Step 2: Add the API Key to Lovable Cloud
Add the `RESEND_API_KEY` secret through the Lovable interface.

### Step 3: Set Up Daily Cron Job
Run this SQL in your Lovable Cloud backend to enable daily reminders at 9 AM:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the cron job
SELECT cron.schedule(
  'send-daily-anniversary-reminders',
  '0 9 * * *', -- Run at 9 AM every day
  $$
  SELECT
    net.http_post(
        url:='https://ozgghjbvhveswqplzegd.supabase.co/functions/v1/send-anniversary-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Z2doamJ2aHZlc3dxcGx6ZWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NTIxMDIsImV4cCI6MjA3NTMyODEwMn0.YSxdFBfe9QMl_Y5gV3tO808ZKXTLsTJ_j6FUgI8yN48"}'::jsonb
    ) as request_id;
  $$
);
```

### Step 4: Test the System
You can manually trigger the edge function to test:
1. Create a test image with an occasion date 7 days in the future
2. Make sure your user has `anniversary_reminders` enabled in settings
3. Call the edge function manually or wait for the cron job

## Customization

### Email Template
Edit `supabase/functions/send-anniversary-reminders/index.ts` to customize:
- Email subject line
- Email HTML content
- Sender name/email (update `from` field after domain verification)
- Reminder timing (currently 7 days before)

### Reminder Schedule
Edit the cron expression in the SQL above:
- `0 9 * * *` = 9 AM daily
- `0 9 * * 1` = 9 AM every Monday
- `0 9,17 * * *` = 9 AM and 5 PM daily

See https://crontab.guru for cron schedule examples.

## Monitoring

Check edge function logs for reminder activity:
- View logs in Lovable Cloud backend dashboard
- Look for "Reminders processed" messages
- Check `reminder_logs` table for sent reminder history

## User Settings

Users can manage their preferences at `/settings`:
- Toggle anniversary reminders on/off
- Control other notification preferences
- Changes take effect immediately for next reminder cycle