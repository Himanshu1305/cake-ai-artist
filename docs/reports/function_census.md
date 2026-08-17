# Edge Function Census — Migration Step B/C

**Generated:** 2026-08-18 · **Purpose:** decide which functions to deploy to the new
Supabase project `gadiwsbvbycfygsaizja` (Mumbai, ap-south-1). Dead code is NOT migrated —
it adds attack surface and maintenance cost with no benefit.

**Method.** A function is **LIVE** if it is reachable in production by any of:
- `supabase.functions.invoke('name')` or `fetch(.../functions/v1/name)` from `src/`
- an external caller (Razorpay webhook)
- a scheduled cron job (`pg_cron`, or external HTTP trigger gated by `CRON_SECRET`)
- a function-to-function call from another LIVE function

A function is **DEAD** if it is only a manual test harness or has no reachable caller.

Total folders in `supabase/functions/` (excluding `_shared`): **36**.
**33 LIVE · 1 LIVE-but-unconfirmed-trigger · 2 DEAD.**

---

## LIVE — deploy these (34: the 33 confirmed + `send-welcome-email`)

| # | Function | Reached by | Evidence |
|---|----------|-----------|----------|
| 1 | add-contact-to-brevo | src | `functions.invoke` |
| 2 | analyze-cake-photo | src | `functions.invoke` |
| 3 | analyze-cake-text | src (fetch) | `src/utils/cakeTextOverlay.ts:62` `fetch(.../functions/v1/analyze-cake-text)` |
| 4 | cake-generation-watchdog | **pg_cron** | header: "runs every 10 minutes via pg_cron"; auto-fails stuck jobs |
| 5 | cancel-razorpay-subscription | src | `Admin.tsx:800` `functions.invoke` |
| 6 | check-payment-status | src | `functions.invoke` |
| 7 | create-razorpay-order | src | `useRazorpayPayment.ts:233` |
| 8 | create-razorpay-subscription | src | `useRazorpayPayment.ts:143` |
| 9 | delete-user-account | src | `functions.invoke` |
| 10 | detect-country | src | `functions.invoke` |
| 11 | generate-blog-post | src **+ cron** | `functions.invoke`; reads `CRON_SECRET`; writes `scheduled_task_runs` |
| 12 | generate-complete-cake | src | core generator; `functions.invoke` |
| 13 | generate-invite-artwork | src | `functions.invoke` |
| 14 | generate-invite-copy | src | `functions.invoke` |
| 15 | generate-logo | src | `functions.invoke` |
| 16 | generate-party-pack | src | `functions.invoke` |
| 17 | generate-vendor-message | src | `functions.invoke` |
| 18 | grant-referral-bonus | src | `Auth.tsx:332` `functions.invoke` |
| 19 | party-planner-chat | src | `functions.invoke` |
| 20 | razorpay-webhook | **external webhook** | Razorpay → `/functions/v1/razorpay-webhook`; `verify_jwt=false` |
| 21 | save-cake-audio | src | `functions.invoke` |
| 22 | save-image-to-storage | src | `CakeCreator.tsx:1297` `functions.invoke` |
| 23 | search-local-vendors | src | `functions.invoke` |
| 24 | send-anniversary-reminders | src **+ cron** | `functions.invoke`; reads `CRON_SECRET` |
| 25 | send-engagement-drip | src **+ cron** | `functions.invoke`; `CRON_SECRET`; `scheduled_task_runs` |
| 26 | send-party-invite | src | `functions.invoke` |
| 27 | send-premium-emails | src **+ function-to-function** | `functions.invoke`; called by `razorpay-webhook:75/106` & `verify-razorpay-payment:224` |
| 28 | send-reengagement-sequence | **cron** | reads `CRON_SECRET`; daily-9am schedule is a pending manual action (§7 of context) |
| 29 | send-vendor-email | src | `functions.invoke` |
| 30 | send-weekly-blog-digest | src **+ cron** | `functions.invoke`; `CRON_SECRET`; `scheduled_task_runs` |
| 31 | send-weekly-upgrade-nudge | src **+ cron** | `functions.invoke`; `CRON_SECRET`; `scheduled_task_runs` |
| 32 | unsubscribe-blog | src | `functions.invoke` (unsubscribe link handler) |
| 33 | verify-razorpay-payment | src | `useRazorpayPayment.ts:289` |
| 34 | send-welcome-email | ⚠️ **unconfirmed** | see note below — recommend deploy anyway |

### ⚠️ `send-welcome-email` — deploy, but confirm its trigger
- **No `functions.invoke('send-welcome-email')` or fetch exists anywhere in `src/` or in other functions.** The only reference is a *comment* in `Auth.tsx:342` ("Welcome email is sent separately via send-welcome-email edge function using Resend").
- The function reads the caller's **user JWT** (`user.email`, line 213) plus `{ isPremium }` from the body — i.e. it is shaped for a **client-side invoke with the user's auth token**, not a cron/batch job.
- Most likely it is triggered by a dashboard-configured **Supabase Auth hook / DB webhook**, or the client invoke was removed and the comment is stale (orphaned).
- **Recommendation: deploy it.** Risk is asymmetric — deploying an unused email function is cheap; failing to deploy a live welcome-email path silently breaks onboarding. **Action for you:** confirm in the old project's dashboard whether an auth hook / webhook points at `send-welcome-email`, and recreate it on the new project if so.

---

## DEAD — do NOT deploy (2)

| Function | Why dead | Notes |
|----------|----------|-------|
| test-premium-email | Manual QA harness. Gated by `TEST_EMAIL_SECRET`. Only invokes `send-premium-emails` for testing. No app/cron/production caller. | Deploy on-demand later if you need to re-test premium email rendering. |
| test-weekly-digest | Manual QA harness. Gated by `TEST_EMAIL_SECRET`. No app/cron/production caller. | Same — deploy on-demand only. |

Neither is called from `src/`, by cron, by a webhook, or by another LIVE function. They exist
purely to let a developer fire a test email via curl. Skipping them removes two
secret-gated public endpoints from the new project.

---

## Cron dependencies that do NOT travel with `functions deploy`

Deploying the code does **not** recreate the schedules. These must be re-established on the
new project (dashboard cron / `pg_cron` / external scheduler with `CRON_SECRET`):

- `cake-generation-watchdog` — every 10 min (pg_cron) — **critical**: without it, stuck cake jobs never auto-fail ("stuck at 75%").
- `generate-blog-post` — blog cadence
- `send-anniversary-reminders`
- `send-engagement-drip`
- `send-reengagement-sequence` — daily 9am (was already pending, never scheduled)
- `send-weekly-blog-digest`
- `send-weekly-upgrade-nudge`

No `cron.schedule` statements exist in `supabase/migrations/` — the schedules lived in the
Lovable/Supabase dashboard and must be manually recreated. `scheduled_task_runs` (tracking
table) IS in migrations and will come over with the DB.

---

## Deploy note — `--no-verify-jwt`

`config.toml` sets `verify_jwt = true` for most functions (and `false` for `razorpay-webhook`,
`send-anniversary-reminders`). The bulk command `supabase functions deploy --no-verify-jwt`
overrides ALL of them to no-JWT. That is fine for functions doing their own auth (`CRON_SECRET`,
Razorpay signature, service-role), but note it drops the platform JWT gate on user-facing
functions. If you want to preserve per-function JWT settings, deploy **without** `--no-verify-jwt`
so `config.toml` is honoured. (The migration instruction specifies `--no-verify-jwt`; flagging
the tradeoff, not overriding it.)
