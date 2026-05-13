## Fix 3 homepage regressions

### 1. Menu items missing on tablet/medium screens
The desktop nav uses `hidden lg:flex` (≥1024px). The user's viewport is 946px, so only the hamburger shows. With 8+ menu items, the row would wrap if simply lowered to `md:`.

**Change** in `src/pages/Index.tsx` nav block (around lines 314–343):
- Lower the breakpoint to `md:flex` (≥768px) and tighten the row so it fits at ~900–1024px:
  - Use `gap-1` instead of `gap-2`
  - Buttons: `size="sm"` already; add `px-2` and `text-xs lg:text-sm` so labels stay on one line at 946px
  - Hide secondary items between md and lg to prevent wrapping: add `hidden lg:inline-flex` to **Examples**, **Community**, **FAQ** and **Settings** wrappers (keep How It Works, Party Planner, Pricing, Blog, Gallery, Admin, Sign In/Logout always visible from md+)
- Update the hamburger trigger from `lg:hidden` to `md:hidden`

This restores menu visibility at the user's current 946px viewport while preventing overflow.

### 2. "Join hundreds…" line missing
The `UrgencyBanner` component was stubbed during the pricing migration (`src/components/UrgencyBanner.tsx` now returns `null`). The "Join hundreds of creators…" social-proof copy lived inside it.

**Change** — restore a lightweight, non-urgency social-proof banner in `src/components/UrgencyBanner.tsx`:
- Render a slim sticky bar (no countdowns, no scarcity claims — just evergreen social proof, per project memory rules):
  - Desktop: `Join` **`hundreds of`** `creators designing AI cakes · Start free, no signup needed`
  - Mobile: **`hundreds of`** ` creators · Start free`
- Use existing party gradient tokens; report real height to `onHeightChange` (≈40px) and `onVisibilityChange(true)` so the sticky nav offsets correctly.
- Keep the existing props/signature so `Index.tsx` and other pages don't need to change.

### 3. Too much empty space above "AI CAKE DESIGN STUDIO"
Two compounding causes in the hero (`src/pages/Index.tsx` lines 432–505):
- The grid uses `items-center`, so the shorter left text column gets vertically centered against the tall `CakeWall` on the right, pushing the badge ~120–180px down at md.
- Section padding `py-12 md:py-24` adds another large top gap.
- An empty `<div>` placeholder on lines 441–442 is leftover from a removed element.

**Change**:
- Replace `items-center` with `md:items-start` on the grid (line 433) so the badge aligns to the top of the cake wall.
- Reduce hero section padding from `py-12 md:py-24` to `py-6 md:py-12` (line 432).
- Remove the empty `<div>` on lines 441–442.

### Files touched
- `src/pages/Index.tsx` — nav breakpoints + button sizing, hero grid alignment + padding, remove empty div
- `src/components/UrgencyBanner.tsx` — restore evergreen social-proof banner

### Verification
- At 946px: menu items render in a single row, hamburger hidden.
- Top of page shows the "Join hundreds of creators…" bar.
- Badge "AI CAKE DESIGN STUDIO" sits near the top of the hero, aligned with the top of the cake wall.
- At ≤767px: hamburger reappears, mobile banner copy renders.
