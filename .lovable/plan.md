

## Plan: Change Free User Limit to 5 Total Generations (Lifetime)

### What Changes

Replace the current daily (3/day) and monthly (12/month) rolling limits for free users with a **hard total lifetime limit of 5 generations**. Once used, free users must upgrade to continue creating.

### Changes Required

**1. `src/components/CakeCreator.tsx`**
- Remove `FREE_DAILY_LIMIT` (3) and `FREE_MONTHLY_LIMIT` (12) constants
- Add `FREE_TOTAL_LIMIT = 5`
- Replace the two separate limit checks (daily + monthly) with a single check: `totalGenerations >= FREE_TOTAL_LIMIT`
- Update the toast messages to say "You've used all 5 free generations" instead of daily/monthly messaging
- Update the UI text (line ~1281) from `dailyGenerations/FREE_DAILY_LIMIT today • monthlyGenerations/FREE_MONTHLY_LIMIT this month` to `totalGenerations/5 free generations used`
- The `totalGenerations` state already exists and is already computed by summing all `generation_tracking` rows for the user (lines 430-439), so no new query needed

**2. `src/components/GenerationLimitTracker.tsx`**
- Change label from "Daily Creations" to "Free Generations"
- Change `remaining/limit left today` to `remaining/limit remaining`
- Update the warning text from "out of free cakes for today" to "out of free generations"

**3. `src/components/PremiumComparison.tsx`**
- Update comparison row from "Unlimited generations" (free: false) to show "5 total" for free, "150/year" for premium
- Update gallery slots row: free shows "5" instead of implying unlimited

**4. `supabase/functions/send-weekly-upgrade-nudge/index.ts`**
- **Variant 2 (comparison table)**: Change "5/day" to "5 total" for free tier, gallery slots from "20" to "5"
- **Variant 4 (urgency)**: Add localized pricing using `profiles.country` field (pricing map: IN=₹4,100, GB=£39, CA=C$67, AU=A$75, default=$49)
- **Test mode** (line 235): Query admin's actual `first_name` from profiles instead of hardcoding "Admin"
- **Production mode**: Query `profiles.country` alongside `id, email, first_name` to pass localized price into variant 4 HTML
- Update `getEmailHtml` signature to accept optional `countryCode` parameter
- Update subject line for variant 4 to use localized price

**5. Database migration: Update `enforce_image_limit` trigger**
- Change free user gallery slot limit from 20 to 5

**6. `src/pages/Terms.tsx`**
- Update line "Free users can generate up to 3 cakes per day" to "Free users can generate up to 5 cakes total"

### Technical Details

```text
Current limit flow (free users):
  dailyGenerations >= 3  → blocked (resets daily)
  monthlyGenerations >= 12 → blocked (resets monthly)

New limit flow (free users):
  totalGenerations >= 5  → blocked (never resets)
```

The `totalGenerations` state is already computed in `CakeCreator.tsx` (lines 430-439) by summing all `generation_tracking.count` rows for the user. No new database queries or schema changes needed for tracking — only the `enforce_image_limit` trigger needs updating for gallery slots.

### No Changes Needed
- `generation_tracking` table schema stays the same (rows still accumulate, we just sum them all now)
- Premium/admin limits unchanged (150/year and 500/year respectively)

