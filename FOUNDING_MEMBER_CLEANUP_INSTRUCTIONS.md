# Founding Member Sale - Manual Cleanup Instructions

## 🔔 JANUARY 1ST DECISION POINT

**Automatic cleanup is NOW ENABLED** - After December 31, 2025, the system will automatically:
- Hide the UrgencyBanner from all pages
- Show "Sale Ended" message in CountdownTimer
- Display AdminSaleReminder component to logged-in users

**You have two options on/after January 1st, 2026:**

### Option A: Extend the Sale

1. Open `src/components/UrgencyBanner.tsx` (line 18)
   - Change: `const saleEndDate = new Date('2025-12-31T23:59:59');`
   - To: `const saleEndDate = new Date('2026-01-31T23:59:59');` (or your new date)

2. Open `src/components/CountdownTimer.tsx` (line 11)
   - Change: `const SALE_END_DATE = new Date('2025-12-31T23:59:59');`
   - To: `const SALE_END_DATE = new Date('2026-01-31T23:59:59');` (same new date)

3. That's it! Banner and timer will continue running with new date.

### Option B: Close the Sale Permanently

Follow the detailed cleanup steps in the sections below.

---

## What Happens Automatically After Dec 31, 2025

1. **UrgencyBanner.tsx** (line 18-23)
   - Auto-hide after December 31, 2025 is ENABLED
   - Banner will hide automatically when `isSaleActive` becomes false
   - To extend: Update the `saleEndDate` variable

2. **CountdownTimer.tsx** (line 14-22)
   - "Sale Ended" message is ENABLED
   - Timer will show "Sale Ended" when expired
   - To extend: Update the `SALE_END_DATE` constant

3. **AdminSaleReminder.tsx** (new component)
   - Shows reminder banner to all users on/after January 1, 2026
   - Provides quick decision options (extend or close)
   - Can be dismissed for a day or permanently

4. **useCountdown.ts** hook
   - Displays console warning on/after January 1, 2026
   - Warning shown once per browser session
   - Reminds you to make a decision about the sale

## When to Perform Cleanup (ONLY AFTER USER APPROVAL)

After consulting with the user and getting approval, perform these cleanup steps:

### Step 1: Hide Founding Member Sale UI
- [ ] Remove `<UrgencyBanner />` from `src/pages/Index.tsx`
- [ ] Remove countdown timer from homepage hero section
- [ ] Remove "🔥" badge from Pricing link in navigation
- [ ] Update homepage hero to standard messaging (not founding sale)

### Step 2: Update Pricing Page
- [ ] Keep Wall of Founders link in navigation (as social proof)
- [ ] Archive or hide Tier 1 and Tier 2 founding member cards
- [ ] Show only regular monthly/annual pricing
- [ ] Update copy to remove "limited time" language
- [ ] Update FAQ to past tense for founding member questions

### Step 3: Update Wall of Founders
- [ ] Add "Closed" or "Complete" badge to page
- [ ] Update hero text: "The Founding 200 - Now Closed"
- [ ] Remove countdown and CTA section
- [ ] Keep member grid as social proof

### Step 4: Update Exit Intent Modal
- [ ] Revert to standard premium offer (not founding member)
- [ ] Remove countdown timer from modal
- [ ] Remove founding member comparison table
- [ ] Update copy to regular premium benefits

### Step 5: Archive Components (Optional)
Move these to an `archive/` folder if no longer needed:
- [ ] `src/components/CountdownTimer.tsx`
- [ ] `src/components/SpotsRemainingCounter.tsx`
- [ ] `src/components/UrgencyBanner.tsx`
- [ ] `src/components/FoundingMemberBadge.tsx` (keep if using on Wall)
- [ ] `src/components/LivePurchaseNotifications.tsx`

### Step 6: Keep These Active
✅ DO NOT REMOVE:
- Wall of Founders page and route (`/wall-of-founders`)
- FoundingMemberBadge component (used to display badges)
- founding_members database table
- get_available_spots() SQL function
- Profile badges for existing founding members

## Files to Review for Cleanup

- `src/pages/Index.tsx` - Homepage hero and navigation
- `src/pages/Pricing.tsx` - Pricing cards and copy
- `src/pages/WallOfFounders.tsx` - Update hero text and CTA
- `src/components/ExitIntentModal.tsx` - Revert to standard offer
- `src/components/UrgencyBanner.tsx` - Can be removed entirely
- `src/App.tsx` - Keep /wall-of-founders route

## Testing After Cleanup

1. Verify homepage shows standard hero (no countdown)
2. Verify pricing page shows only regular plans
3. Verify Wall of Founders is still accessible
4. Verify existing founding member badges still display correctly
5. Verify navigation no longer has "🔥" badge on Pricing

---

**Remember: DO NOT perform any of these actions without explicit user approval!**
