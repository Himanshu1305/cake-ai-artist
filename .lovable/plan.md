## Update banner copy to "#1 AI Cake Generator" authority claim

**File**: `src/components/UrgencyBanner.tsx`

Replace the current "Join hundreds of creators…" copy with:

- **Desktop (≥sm)**: `The #1 AI Cake Generator — design birthday, wedding & anniversary cakes free`
- **Mobile (<sm)**: `#1 AI Cake Generator · Free`

### Implementation
- Keep the same component structure (sticky bar, gradient background, height/visibility callbacks).
- Highlight `#1 AI Cake Generator` in gold for visual emphasis.
- Keep `· Free` styling consistent with current divider/opacity treatment.

### Verification
- At ≥768px: full headline renders on one line.
- At <640px: short mobile variant renders without wrapping.
- Sticky nav offset still works (height callback unchanged).
