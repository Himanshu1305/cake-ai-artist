# Integrate Party Planner into the Cake Generation Flow

## Why this is needed

Today, Party Planner only lives in the site header. Users who just generated a cake (their highest intent moment — they've named a recipient, picked an occasion, theme, date context) are never invited to plan the actual party around it. Meanwhile the Party Pack Generator (printables) already appears in that exact spot, so the slot is proven.

`SuccessCelebration.tsx` exists but is never imported anywhere — dead code we can either delete or repurpose.

## Recommendation

Add a **contextual Party Planner CTA card** in two places, prefilled with the cake's context (recipient name → party title, occasion, theme). Keep it lightweight; don't compete with sharing.

### 1. Inline card under Party Pack section (primary placement)

In `src/components/CakeCreator.tsx` right after the `PartyPackGenerator` block (~line 2806), add a sibling card:

- Heading: "Throw the whole party, not just the cake"
- Subtext: one line about AI concierge + checklist + invites with RSVP
- Primary button → `/party-planner?prefill=...` with `name`, `occasion`, `theme` as query params
- Small "Premium" pill (matches existing Party Planner gating)
- Only show when `isLoggedIn && savedCakeImageId` (same gate as Party Pack)

### 2. Post-generation success modal (secondary, optional reach)

Wire up the unused `SuccessCelebration.tsx` so it actually fires after a successful generation, and add a 4th button: **"Plan the Party →"** alongside Share / Download / Create Another. This catches users who close the editor immediately.

If you'd rather not touch the success flow, we can skip #2 and ship only #1.

### 3. Prefill on Party Planner side

In `src/pages/PartyPlanner.tsx`, read `?prefill=` query params on mount. If present and the user has no existing party with that title, auto-open the "New Party" dialog with the title prefilled (e.g. "Mia's Birthday"). Then when the party is created, also seed `occasion` and `theme` on the insert so the AI concierge skips re-asking.

### 4. Non-premium handling

Party Planner is premium-gated. The CTA should still be visible to free users — clicking takes them to `/party-planner`, which already shows the upgrade screen. This doubles as a soft upsell at peak excitement. Add a subtle "Premium" badge so expectations are clear.

## Files to change

- `src/components/CakeCreator.tsx` — add CTA card after PartyPackGenerator block (~line 2806)
- `src/pages/PartyPlanner.tsx` — read prefill query params, auto-open create dialog, seed occasion/theme
- `src/components/SuccessCelebration.tsx` — add "Plan the Party" button (only if doing #2)
- `src/components/CakeCreator.tsx` — actually mount `<SuccessCelebration>` after a successful save (only if doing #2)

## Out of scope (flag for later)

- Reverse direction: from inside a Party Planner party, deep-link to the cake creator prefilled with the party's recipient/occasion/theme. Worth doing in a follow-up — closes the loop both ways.
- Showing the generated cake image as the party's hero on the planner detail page.

## Open question

Do you want **both** placements (#1 inline card + #2 success modal), or just the inline card? The inline card alone is the safe minimum; adding the modal gives broader reach but means wiring up currently-dead code.
