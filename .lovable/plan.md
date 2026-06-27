
# Phase 1 — Revenue Sprint (2 weeks)

Goal: ship the conversion funnel so the first dollars start flowing while traffic builds. AdSense is deferred 30 days per your call — we'll prep it now so approval is one-click later.

---

## 1. Party Pack launch pricing — ₹299 / $5 (permanent access)

New low-friction tier sitting BELOW Lifetime, designed as the first "yes" from a free user. **One-time payment = permanent access to that Party Pack forever** (simpler to support, no refund disputes).

**Pricing matrix** (purchasing-power adjusted, all one-time):
| Country | Price | Razorpay tier code |
|---|---|---|
| IN | ₹299 | `partypack_in` |
| US | $5 | `partypack_us` |
| GB | £4 | `partypack_gb` |
| CA | C$7 | `partypack_ca` |
| AU | A$8 | `partypack_au` |

**What's included:**
- 1 Party Pack (invites + thank-you cards + games + menu)
- Unlimited regenerations for that one event
- HD downloads, no watermark
- **Permanent access** — re-download anytime

**Implementation:**
- Add `partypack_*` tiers to `useRazorpayPayment.ts` + `create-razorpay-order` edge function
- New `party_pack_purchases` table (user_id, country, amount, razorpay_payment_id, party_pack_id nullable, created_at) with GRANTs + RLS — no `expires_at`
- Update `verify-razorpay-payment` to branch on tier prefix: `lifetime_*` → founding_members flow; `partypack_*` → party_pack_purchases flow
- New "Party Pack" card in `PricingPlans.tsx` (4-column layout: Party Pack / Monthly / Yearly / Lifetime)
- Gate Party Pack downloads in `PartyPackGenerator.tsx` on having ≥1 row in `party_pack_purchases` OR `is_premium=true`

---

## 2. Post-share upgrade modal

The single highest-leverage change. Right now after a user shares a cake, nothing happens. We catch them at peak excitement.

**Trigger:** Fires once per session, 3 seconds after the share dialog opens in `CakeCreator.tsx`.

**Modal content** (country-aware copy + price):
- Headline: "🎉 Loved it? Plan the whole party in 5 min"
- 3-bullet value (invites, games, thank-yous)
- Primary CTA: "Get Party Pack — ₹299" (opens Razorpay directly, skips pricing page)
- Secondary CTA: "Maybe later"
- Tertiary text link: "See all plans →" (goes to /pricing)

**Implementation:**
- New `PostShareUpgradeModal.tsx`
- Frequency cap: localStorage flag `lastShareModalShown` — max once per 48h per user
- Skip if user already has lifetime or any Party Pack purchase
- Variant key in localStorage for future A/B testing

---

## 3. First-week discount

Urgency hook for new signups. Active for the user's first 7 days only.

**Mechanic:**
- 30% off Lifetime + Party Pack during first week (₹2,099 lifetime IN / $34 US; ₹209 party pack IN / $3.5 US)
- Visible countdown timer on /pricing and in post-share modal
- **Server-validated** in `create-razorpay-order` (check `profiles.created_at < 7 days ago`) — no client trust

**Implementation:**
- Edge function reads `profiles.created_at` and applies 0.7x when eligible
- New `FirstWeekBadge.tsx` component using existing `CountdownTimer`
- Show on: /pricing hero, post-share modal, exit-intent modal

---

## 4. AdSense readiness checklist (no submission yet)

You're right to wait — submitting too early = rejection + 6-month cooldown. We prep everything so submission in 30 days is clean.

**Best practice (Google's actual approval criteria):**
1. **Min 30+ pages of unique, deep content** — we have ~200 programmatic pages, but Google may flag thin ones. Action: audit weakest pages, deepen or noindex.
2. **Privacy Policy + Terms + Contact + About** — already shipped ✓
3. **ads.txt** — already shipped ✓
4. **Traffic origin** — needs organic > 0. Currently ~14 US visits/mo. Wait until ≥500/mo organic.
5. **Site age** — 6+ months helps. We qualify.
6. **No copyright/prohibited content** — clean ✓

**What I'll do this sprint:**
- Audit name/theme pages with thin content flags (manual review of 10 samples)
- Add `noindex` to name pages where the name has very low global search volume (low-value index bloat)
- Verify `ads.txt`, `sitemap.xml`, `llms.txt` are current
- Create `ADSENSE_READINESS.md` tracking doc with go/no-go gates for submission in 30 days

**Recommendation:** Submit when you hit BOTH (a) 500+ organic monthly visitors AND (b) 30 days of consistent traffic.

---

## Technical summary

```text
DB migrations:
  + party_pack_purchases table (with GRANTs + RLS)

Edge functions:
  ~ create-razorpay-order   (add partypack_* tiers + first-week 30% discount)
  ~ verify-razorpay-payment (branch on tier prefix; insert into party_pack_purchases for partypack_*)

New components:
  + PostShareUpgradeModal.tsx
  + FirstWeekBadge.tsx

Modified:
  ~ PricingPlans.tsx          (4-column layout, add Party Pack card)
  ~ useRazorpayPayment.ts     (new tier codes)
  ~ CakeCreator.tsx           (trigger PostShareUpgradeModal after share)
  ~ Pricing.tsx               (FirstWeekBadge in hero)
  ~ PartyPackGenerator.tsx    (gate download on purchase OR premium)

Audit deliverable:
  + ADSENSE_READINESS.md
```

---

## Sequencing

1. **Day 1-2:** Party Pack pricing (DB + edge functions + 4th plan card + gating)
2. **Day 3-4:** Post-share upgrade modal (highest-conversion lever)
3. **Day 5-6:** First-week discount (server-validated)
4. **Day 7:** AdSense audit + checklist doc

After Phase 1 ships, we measure for 7 days, then decide Phase 2.

Approve to switch to build mode.
