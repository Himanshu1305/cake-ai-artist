# Prevent silent credit-exhaustion outages

## What happened

Between 11 Aug 17:56 and 12 Aug 03:57 UTC, 9 cake jobs failed with `CREDITS_EXHAUSTED` — all three views (hero, side, top) empty on every job. Credits are topped up and generation is confirmed working again.

Three things let a ~10-hour outage stay invisible:

1. The watchdog sent **one** generic "Generation degraded" email at 18:40 and then went quiet for the remaining 9 hours (1-hour cooldown per alert type, and low traffic keeps the hourly sample under the 3-job minimum).
2. That email said "high failure rate" — it never said the actual cause was zero credits, so it read like another model outage.
3. Jobs with zero images are stored as `partial_failed`, the same status as a job that produced 2 of 3 views. Nothing distinguishes total failure from partial.

## What to change

### 1. Credit exhaustion becomes its own alert, with no hour-long silence

Add a dedicated `credits_exhausted` alert type to the watchdog. It fires as soon as **any single job** in the last hour carries a `CREDITS_EXHAUSTED` error — no 3-job minimum, no failure-rate maths. Its cooldown is 6 hours instead of 1, and the email is explicit: "AI credits are exhausted — every cake generation is failing. Top up now." Because it is a distinct alert type it does not compete with the generic degraded alert for the cooldown slot.

### 2. A daily still-broken reminder

If the credit outage is still ongoing at the next check after 6 hours, the alert re-sends. That closes the gap where one email at 18:40 was the only signal for a full night.

### 3. Correct job status for total failures

When a job ends with zero of three views filled, mark it `failed`, not `partial_failed`. This is a one-line status decision in `generate-complete-cake` plus the matching branch in the watchdog's stuck-job handler. It makes the admin view and the watchdog's own failure counting honest, and lets the UI stop offering "retry this slot" on a job that has no slots.

### 4. Clear user-facing message

Today a credit failure surfaces to the user through the generic error path. Give the 402 case its own copy in `CakeCreator`: tell the user the design service is temporarily unavailable and that their generation was **not** counted, rather than a vague failure that reads like they did something wrong.

### 5. Confirm the free-generation counter is not charged

Verify that a job failing with `CREDITS_EXHAUSTED` does not increment `generation_tracking`. If it does, move the increment to after the first successful image. A user must never lose one of their 5 free cakes to our billing problem.

## Technical notes

- `supabase/functions/cake-generation-watchdog/index.ts` — new `credits_exhausted` branch evaluated before the existing threshold logic; per-alert-type cooldown (6h for credits, 1h for the rest) instead of the single `ALERT_COOLDOWN_MINUTES` constant; scan `hero_error`/`side_error`/`top_error` for the marker.
- `supabase/functions/generate-complete-cake/index.ts:838` — `filled === 0` resolves to `failed`.
- `src/components/CakeCreator.tsx` — dedicated copy on the 402 / credits branch.
- Both edge functions must be redeployed; a git push alone does not deploy them.
- No schema change. `system_alert_log` already stores arbitrary `alert_type` and `details`.

## Not included

The 9 jobs that already failed are left as-is, per your decision — those users can generate again.
