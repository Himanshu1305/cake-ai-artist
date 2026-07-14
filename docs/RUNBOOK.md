# Runbook — Cake AI Artist

Top-5 production incidents and response playbooks.

---

## Incident 1: AI model unavailable / images not generating

**Symptoms**
- Users report blank cakes or generation stuck on "Generating…"
- Admin watchdog email arrives with subject containing `high_failure_rate`
- `cake_generation_jobs` rows stuck in `in_progress` > 5 min

**Likely causes**
- OpenRouter model outage (check https://openrouter.ai/status)
- Credits exhausted on OpenRouter account
- IMAGE_FALLBACK_CHAIN all models returning 4xx/5xx

**Response**
1. Check OpenRouter status page and credits dashboard
2. Review `cake_generation_events` for recent `hero_error` values:
   ```sql
   select hero_error, count(*) from cake_generation_jobs
   where created_at > now() - interval '1 hour'
   group by 1 order by 2 desc;
   ```
3. If one model is broken, update `IMAGE_FALLBACK_CHAIN` in `supabase/functions/_shared/ai-models.ts`
4. Redeploy affected edge functions via Supabase dashboard
5. Manually mark stuck jobs as failed:
   ```sql
   update cake_generation_jobs set status = 'failed', hero_error = 'manual_ops_mark'
   where status = 'in_progress' and updated_at < now() - interval '10 minutes';
   ```

---

## Incident 2: Payment succeeds but premium not granted

**Symptoms**
- User contacts support saying they paid but can't access premium features
- Razorpay dashboard shows payment captured
- `profiles.is_premium` is still false

**Likely causes**
- Webhook from Razorpay not delivered (network/firewall)
- `razorpay-webhook` edge function threw an error
- Payment was verified client-side (`verify-razorpay-payment`) but DB update failed

**Response**
1. Check Razorpay dashboard → Webhooks → delivery log for the webhook URL
2. Check edge function logs in Supabase dashboard for `verify-razorpay-payment` and `razorpay-webhook`
3. If webhook failed: manually trigger via Razorpay dashboard "Retry" button
4. Emergency manual grant (after confirming payment in Razorpay):
   ```sql
   update profiles set is_premium = true, premium_granted_at = now()
   where email = 'user@example.com';
   ```
5. Check `premium_payments` table for the payment record; insert manually if missing

---

## Incident 3: Users hitting free generation limit prematurely

**Symptoms**
- Users report "limit reached" after fewer than 5 cakes
- Support requests spike around limit messaging

**Likely causes**
- `generation_tracking` double-count bug (was fixed — month IS NULL filter)
- `FREE_TOTAL_LIMIT` constant mismatch between frontend and edge function
- User's `generation_tracking` yearly row has an incorrect `count`

**Response**
1. Confirm the fix is in place:
   ```sql
   -- Should show only yearly rows (month IS NULL) for a user
   select * from generation_tracking where user_id = '<uid>' and month is null;
   ```
2. If count is wrong, correct it:
   ```sql
   update generation_tracking set count = <actual>
   where user_id = '<uid>' and month is null and year = extract(year from now());
   ```
3. Verify `FREE_TOTAL_LIMIT = 5` in both:
   - `src/components/CakeCreator.tsx`
   - `supabase/functions/generate-complete-cake/index.ts`

---

## Incident 4: SharedCake email capture not working

**Symptoms**
- Shared cake recipients enter email but don't appear in Brevo list #3
- No error shown to user (silent failure)

**Likely causes**
- `add-contact-to-brevo` returning 401 (anonymous call missing `anonymous: true`)
- IP rate limit hit (5 req/IP/hr) — check `brevo_anon_rate_limits` table
- `BREVO_API_KEY` env var missing or expired

**Response**
1. Check `brevo_anon_rate_limits` for the IP:
   ```sql
   select * from brevo_anon_rate_limits
   where window_start > now() - interval '1 hour'
   order by request_count desc limit 20;
   ```
2. Check Supabase edge function logs for `add-contact-to-brevo`
3. Verify `BREVO_API_KEY` is set in Supabase → Settings → Edge Functions → Secrets
4. Test via curl:
   ```bash
   curl -X POST https://<project>.supabase.co/functions/v1/add-contact-to-brevo \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","anonymous":true}'
   ```

---

## Incident 5: Admin page analytics showing wrong numbers

**Symptoms**
- User counts don't match Supabase Auth user count
- Premium count looks inflated or deflated

**Likely causes**
- `loadAnalytics` fetches max 1000 rows — exceeds this for large user bases
- `is_premium` flag out of sync with `premium_payments` table

**Response**
1. For accurate counts, query directly:
   ```sql
   select count(*) from profiles;
   select count(*) from profiles where is_premium = true;
   select count(*) from profiles where is_founding_member = true;
   ```
2. Check for premium/payment sync issues:
   ```sql
   select p.email, p.is_premium, pp.payment_status
   from profiles p
   left join premium_payments pp on pp.user_id = p.id
   where p.is_premium != (pp.payment_status = 'captured')
   limit 20;
   ```
3. If Admin analytics limit (1000) is regularly exceeded, raise the limit in `loadAnalytics()` in `src/pages/Admin.tsx`
