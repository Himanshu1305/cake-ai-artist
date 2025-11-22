# Founding Member Sale - Manual Cleanup Instructions

⚠️ **IMPORTANT: DO NOT PERFORM THESE ACTIONS WITHOUT USER APPROVAL** ⚠️

The founding member sale countdown and UI elements are currently set to continue displaying even after January 1, 2026. The automatic cleanup has been **DISABLED** per user request.

## What Was Disabled

The following automatic cleanup behaviors have been commented out:

1. **UrgencyBanner.tsx** (line ~25-26)
   - Auto-hide after December 31, 2025 is DISABLED
   - Banner will continue showing indefinitely
   - Search for: `TODO: MANUAL CLEANUP REQUIRED`

2. **CountdownTimer.tsx** (line ~19-24)
   - "Sale Ended" message is DISABLED
   - Timer will continue running (may show zeros or negative)
   - Search for: `TODO: MANUAL CLEANUP REQUIRED`

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
