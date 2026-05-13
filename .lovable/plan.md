# Plan: Inactive-User Engagement Drip + Smarter Upgrade Nudge

## Goal
Re-engage the 89% of registered users who never created a cake, while making the existing Weekly Upgrade Nudge target only users who actually engaged.

---

## 1. Database

New table `engagement_email_logs`:
- `user_id` (uuid)
- `email_type` (text: `day2_welcome`, `day7_trends`, `day14_final`)
- `sent_at` (timestamptz)
- Unique on `(user_id, email_type)` so each user gets each email at most once
- RLS: admin-read only; edge function uses service role

No other schema changes.

---

## 2. New Edge Function: `send-engagement-drip`

Runs daily at 09:00 UTC. Logic:

1. Pull all profiles where:
   - User has **never** generated an image (`NOT EXISTS` against `generated_images`)
   - User has `marketing_emails != false` in `user_settings`
   - User is not premium

2. For each user, compute days since signup and pick the right email:
   - **Day 2–6** → `day2_welcome` (if not already sent)
   - **Day 7–13** → `day7_trends` (if not already sent)
   - **Day 14+** → `day14_final` (if not already sent)

3. Skip if log row already exists. Send via Brevo. Insert log row on success.

4. Auto-stop logic is implicit: as soon as user creates a cake, they're filtered out — even mid-drip.

5. Detailed per-user error logging (capture Brevo response body) so we can diagnose the bounce-rate problem.

6. Logs run summary to `scheduled_task_runs` with `task_name = 'engagement-drip'`.

7. Supports `testEmail` body param + variant param for admin "Test Email" button.

---

## 3. Three Email Templates (finalize content together after build)

All match brand: warm cream bg, blue text default, party gradient header, real Cake AI Artist logo. Initial drafts:

### Day 2 — "Your first AI cake is 30 seconds away 🎂"
- Warm welcome by first name
- 3-step "How it works" (describe → AI generates → download/share)
- One sample cake image
- Big CTA → `/free-cake-designer`
- Small footer link to FAQ

### Day 7 — "See what's trending this week ✨"
- "We noticed you haven't made your first cake yet — here's some inspiration"
- 3 trending cakes pulled from `gallery_image_stats` (top by likes this week)
- Latest blog post (from `blog_posts` table)
- CTA → designer
- Localized country reference if available

### Day 14 — "A free design idea for you 🎁"
- Final, soft, no-pressure
- One personalized occasion suggestion based on country/season
- "Reply if anything's blocking you" (humanizes)
- FAQ link + designer CTA
- No more emails after this in the drip

**These are placeholder drafts — we'll iterate on copy together after the function is built and you can preview each variant via Test Email.**

---

## 4. Modify `send-weekly-upgrade-nudge`

Single change to the eligibility query:
- Add `EXISTS (SELECT 1 FROM generated_images WHERE user_id = profiles.id)` filter
- Result: only free users who have generated ≥1 cake get the upgrade pitch

This eliminates overlap with the engagement drip and raises conversion relevance.

---

## 5. Cron Schedule (via supabase insert tool)

```sql
SELECT cron.schedule(
  'send-engagement-drip',
  '0 9 * * *',
  $$ SELECT net.http_post(
       url := '...send-engagement-drip',
       headers := '...CRON_SECRET...'
     ); $$
);
```

Daily at 09:00 UTC.

---

## 6. Admin UI — Scheduled Tasks Widget

Add `engagement-drip` to `SCHEDULED_TASKS` array in `ScheduledTasksWidget.tsx` with:
- "Run Now" button
- "Test Email" dropdown (Day 2 / Day 7 / Day 14 variants → sends to logged-in admin)
- Standard last-run/next-run/status display

---

## 7. Files

**New:**
- `supabase/functions/send-engagement-drip/index.ts`
- DB migration for `engagement_email_logs` table

**Modified:**
- `supabase/functions/send-weekly-upgrade-nudge/index.ts` (add active-user filter)
- `src/components/ScheduledTasksWidget.tsx` (add new task entry + 3-variant test button)
- `supabase/config.toml` (register new function)

---

## 8. Build Order

1. Migration: `engagement_email_logs` table
2. New edge function with 3 template drafts
3. Cron job
4. Admin widget update
5. Modify upgrade nudge query
6. **Pause for content review** — you preview each of the 3 drip emails via Test Email and we finalize copy/visuals together before going live

Once you approve, I'll execute steps 1–5 in one pass.
