# Growth & Monetization Fix Plan

## What the data actually says

Pulled from the live database just now:

| Signal | Value |
|---|---|
| Profiles | 464 (225 created in last 30 days) |
| Users who ever generated a cake | 252 |
| Average generations per user | 2.3 |
| Users who used all 5 free designs | **3** |
| Users who generated exactly once and stopped | **136 of 178** |
| Subscription rows | 5 — 4 of them stuck at status `created` (checkout started, never activated) |
| Premium profiles | 8, all legacy/admin-granted, none from a completed self-serve purchase |
| Page-visit tracking | only `/`, `/uk`, `/india`, `/australia`, `/canada`, `/usa` — **zero** rows for `/pricing` or the designer |
| Job outcomes | 448 completed, 94 `partial_failed` (17%), 2 failed |

### Answering the four questions

**3. Is the free tier too generous?** No — and that is the surprise. The 5-design limit is almost never reached (3 users ever). The paywall is effectively invisible. Tightening the free limit would fix nothing; the loss happens at design #1.

**2. Why zero free-to-paid?** Three compounding reasons, in order of size:
1. **Checkout does not complete.** Four users reached Razorpay and every one of those rows is still `created`. Combined with the live-key mismatch we hit earlier, payment success is unproven end to end. Nothing else matters until a real payment lands.
2. **The paywall never fires.** Users quit after 1 design, long before the limit.
3. **Nothing worth paying for is visible before paying.** Party Pack, HD download, and the AI Party Planner are described in text, never previewed.

**1 & 4. Growth and everything else** — below, sequenced.

---

## Phase 1 — Make money physically collectable (do first)

1. End-to-end live payment test on each tier (₹ smallest tier first), confirming: order created, Razorpay modal opens with correct key, webhook fires, `subscriptions.status` moves off `created`, `profiles.is_premium` flips.
2. Fix the stuck-`created` path: `verify-razorpay-payment` and `razorpay-webhook` must write a terminal status (`active` / `failed` / `abandoned`) for every order, and log failures to a table we can read.
3. Add an admin "Payments" panel row: last 20 orders with tier, status, and failure reason, so a broken checkout is visible within a day instead of a month.
4. Reach out to the 4 users with `created` rows — if any were charged, grant access manually.

## Phase 2 — See the funnel (nothing improves what we cannot measure)

Extend the existing `page_visits` tracking beyond the 6 landing pages, plus event rows for:
`designer_opened → form_submitted → generation_completed → result_viewed → share_clicked → paywall_seen → pricing_viewed → checkout_started → paid`.

Only then can we say where the 136 one-and-done users leave.

## Phase 3 — Fix the real leak: design #1 → design #2

- **Result-page next-step block.** Today the result is a dead end. Add "Try this cake in another theme / another angle / for another person" as one-tap re-generates.
- **Reduce the 17% partial_failed rate** — a user whose first cake is missing an angle does not come back. Auto-retry the missing view before showing the result, and never present an incomplete cake as finished.
- **Save + return hook.** Email the user their cake link after generation ("your cake is saved, here's the link") — gives a reason to return and a shareable asset.
- **Occasion capture at generation time.** Ask "when is the celebration?" and schedule the reminder; this converts a one-off into a recurring visit.

## Phase 4 — Give the paywall something to sell

- **Preview-then-pay on Party Pack:** generate the topper/banner/invite at low resolution, show it, watermark it, charge to unlock the high-res set. Seeing the artifact converts far better than a feature bullet.
- **Watermark-free / HD download** as the single clearest paid line.
- **Move the first paywall moment earlier and tie it to value, not volume** — trigger on the download/share action of design #1, not on generation #5.
- **One price, one page.** Four tiers on `/pricing` at this traffic level splits intent. Lead with Party Pack (lowest friction, one-time) and Lifetime; demote Monthly/Yearly.
- **Post-purchase proof:** the payment path must show a visible success state and unlock immediately, or refunds/chargebacks follow.

## Phase 5 — User base growth

- **Shareable cake link is the growth loop** — every SharedCake page should carry a "make one for someone" CTA and an OG image of the actual cake. Instrument how many shared links get opened; if the loop works, everything else scales.
- **WhatsApp-first share button for India** (largest visitor segment after `/`).
- **Traffic reality check:** 7,000 page views in 30 days land almost entirely on `/` and the 5 country pages — the ~100 SEO articles are not yet pulling. Before writing more content, check Search Console impressions for the existing set and fix/consolidate what is indexed but not clicked.
- **Reminder emails for saved occasions** are the only true retention lever in a once-a-year product; make sure they are firing.

---

## Technical notes

- Payment: `supabase/functions/create-razorpay-order`, `create-razorpay-subscription`, `verify-razorpay-payment`, `razorpay-webhook`, `src/hooks/useRazorpayPayment.ts`.
- Tracking: `src/hooks/usePageTracking.ts` (currently called from 6 pages only) + `page_visits` table; add an `events` table rather than overloading `page_visits`.
- Free limit lives in `src/components/CakeCreator.tsx` (`FREE_TOTAL_LIMIT = 5`) and duplicated in `src/pages/FreeCakeDesigner.tsx` — centralise before changing paywall timing.
- Partial failures: `supabase/functions/generate-complete-cake` per-view retry before the terminal status write.

## Suggested order

Phase 1 (payment provable) → Phase 2 (funnel visible) → Phase 3 (retention of design #1) → Phase 4 (paywall with a preview) → Phase 5 (loops). Phases 1 and 2 are prerequisites; skipping them means guessing.
