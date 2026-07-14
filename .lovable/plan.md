
## Symptom
- Route: `/pricing?country=IN`, Party Pack ₹299 tile.
- Backend log shows order created successfully: `Creating partypack order: IN 29900 INR`.
- Razorpay modal then shows generic "Oops! Something went wrong / Payment Failed" **before** any payment method is picked, for every user.

When the modal itself blows up on open (no method selection), the failure is on Razorpay's side / config side, not in our order code. There are three realistic causes; the plan diagnoses in order of likelihood, then fixes.

## Diagnosis (do this first, in one pass)

1. **Check for a Key ID mismatch (top suspect).**
   - Server uses `RAZORPAY_KEY_ID` (edge function secret) to create the order.
   - Browser uses `VITE_RAZORPAY_KEY_ID` (build env) to open the Razorpay modal.
   - If one is a `rzp_test_…` and the other is `rzp_live_…`, the modal opens with an order it can't see and instantly shows "Payment Failed". This exactly matches the reported symptom.
   - Read both values (server via `fetch_secrets`, client via the built `.env`) and confirm they belong to the same mode and same account.

2. **Check the Razorpay account state.**
   - Fetch the most recent order via Razorpay Orders API using the server key, confirm it returns `status: created` and the same key can fetch it.
   - If the account is on hold / KYC-pending / international payments disabled, Razorpay returns modal errors even for valid orders. Note the account status.

3. **Check the order object we send.**
   - Confirm `amount: 29900`, `currency: "INR"` (both integers/strings as required), and `receipt` under 40 chars. Current receipt = `<8-char uuid>_<13-digit ts>` = 22 chars — fine.
   - Confirm no `payment_capture: 0` weirdness (we don't send it, so default applies).

## Fixes (apply based on what step 1–3 reveals)

### Fix A — Key mismatch (most likely)
- Update whichever key is wrong so **both** `RAZORPAY_KEY_ID` (edge function) and `VITE_RAZORPAY_KEY_ID` (frontend) point to the same account and same mode (live for production).
- Frontend key is baked at build time, so after updating we need a rebuild / redeploy for it to take effect.

### Fix B — Razorpay account issue
- If Razorpay reports the account is restricted / KYC blocked / INR not enabled, the fix is on the dashboard side — surface a clear message to the user in chat with the exact status and next step; no code change needed.

### Fix C — Harden the client so this never silently fails again
Regardless of root cause, make these small defensive changes in `src/hooks/useRazorpayPayment.ts`:

1. **Assert the key exists before opening the modal.** If `RAZORPAY_KEY_ID` is empty/undefined, show a specific toast ("Payment is temporarily unavailable — please contact support") instead of opening a broken modal.
2. **Surface the real Razorpay error code.** In the `payment.failed` handler, include `response.error.code`, `response.error.reason`, and `response.error.source` in the toast and `console.error`, so future outages are diagnosable from a screenshot.
3. **Log a warning if the returned `orderData.key_id` differs from `RAZORPAY_KEY_ID` used on the client.** The order-create edge function already returns `key_id`; comparing them client-side catches the mismatch class permanently. If they differ, prefer `orderData.key_id` when opening the modal (server is source of truth) and log a warning to Sentry/console.

### Fix D — Docs
- Add a short note to `docs/RUNBOOK.md` under a new "Razorpay modal errors on open" heading listing the three checks above, so the next incident is a 2-minute triage.

## Out of scope
- No changes to pricing, tiers, verification flow, webhook, or DB schema.
- No changes to the subscription (monthly/yearly) path — only the one-time party pack/lifetime flow is affected.

## Technical detail
- Files touched: `src/hooks/useRazorpayPayment.ts`, `docs/RUNBOOK.md`.
- Secrets inspected (not changed unless mismatched): `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `VITE_RAZORPAY_KEY_ID`.
- No migrations, no new tables, no new edge functions.
