## Goal
Find the exact line in `generate-complete-cake` that hangs when you generate a cake on mobile, using your real inputs (Chanchal & Chitranshu / Anniversary / sister).

## Two-step forensic plan

### Step 1 — Live probe from the sandbox (no code changes)
I will call `generate-complete-cake` directly from our server with your exact payload and your premium user's auth token, and watch what happens:

- **Returns in <90s with a `jobId`** → the function works server-to-server. The bug is on the **mobile client path** (Supabase JS on mobile, network, or the `invokeWithRetry` wrapper). We then fix the client.
- **Returns 4xx/5xx quickly** → we get the **exact error string** (auth, rate limit, validation, missing AI key, profile lookup, etc.). Root cause known, fix is direct.
- **Hangs past 90s** → confirms the function itself is the bottleneck. Go to Step 2.

This alone will likely answer "which of the 3 things failed and why" in one shot.

### Step 2 — Permanent stage tracing (only if Step 1 hangs)
Add a tiny `cake_generation_events` table and write one row at each stage inside the function:

```text
1_request_received        → before anything
2_auth_validated          → after supabase.auth.getUser(token)
3_profile_loaded          → after profile/track query
4_job_row_inserted        → after insert into cake_generation_jobs
5_ai_call_started         → just before image model call
6_ai_call_returned        → just after image model returns
7_storage_uploaded        → after upload to cake-images bucket
8_job_marked_complete     → final DB update
```

Each row stores: `user_id`, `stage`, `timestamp`, `duration_ms_since_start`, optional `error_message`.

Then you retry **one more time on mobile**. Whichever stage is **missing** from the events table is the exact line that hung. No more guessing, ever — every future failure leaves a permanent trail in the database.

### Why this works where logs failed
Lovable Cloud only retains a tiny rolling window of edge-function logs (currently 2 entries total for the whole backend), so past failures cannot be replayed from logs. A database events table is permanent, queryable, and survives function restarts/cold starts.

## What I need from you
Nothing more — you already gave me the inputs. Approve this plan and I will:
1. Run the live probe immediately and report the exact response (status code, body, timing).
2. If it hangs, add the events table + stage tracing and ask you to retry once on mobile.

## Out of scope for this plan
No "stability improvements", no retries, no UX changes, no Google tag work. This plan is purely to **identify the real failing line**. Fixes come after the root cause is known.
