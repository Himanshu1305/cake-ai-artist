## Goal

Make the candles on the homepage feel like they're really burning — with realistic flickering, subtle swaying, and a warm glow halo.

## Important Reality Check

The cake images shown in "Recent Creations from Our Community" and the hero carousel are **AI-generated static photos** — the candle flames are baked into the pixels. We cannot animate flames *inside* a static image.

What we **can** do (and what looks great):

1. Build a reusable **animated SVG flame component** (`<AnimatedFlame />`) — pure CSS, no JS, no extra renders.
2. Add **decorative animated candle rows** in key spots on the homepage (above the hero, near the "Create your cake" CTA, in the celebration banner) so the page itself feels alive with burning candles.
3. Upgrade the existing `floating-flame` / `dancing-flame` CSS to be more realistic — multi-layer flicker (yellow core + orange outer + warm glow halo), slight horizontal sway, and randomized timing per candle so they don't all flutter in sync.

## What Will Change

### 1. New component: `src/components/AnimatedFlame.tsx`
A pure-SVG/CSS flame with three layered parts:
- Outer orange/red glow (slow flicker)
- Inner yellow flame core (fast flicker + subtle sway)
- Warm radial halo behind it (gentle pulse)

Props: `size` (sm/md/lg), `swayDelay` (so a row of candles flickers out of sync).

### 2. New component: `src/components/CandleRow.tsx`
Renders 5–7 little gold candles with `<AnimatedFlame />` on top, each with a randomized delay. Used as a decorative banner.

### 3. `src/index.css` — enhanced flame keyframes
- New keyframes: `flame-flicker-realistic` (scaleY + skewX + opacity micro-jitter), `flame-sway` (tiny horizontal rotation), `flame-glow-pulse` (halo breathing).
- Improve existing `.floating-flame` / `.dancing-flame` to use the new keyframes with multi-layer drop-shadows for a warmer, more candle-like glow.

### 4. `src/pages/Index.tsx` — placement
- Add a `<CandleRow />` right above the main hero headline (subtle, decorative).
- Add a `<CandleRow />` inside/above the celebration/CTA section.
- Keep all existing content untouched.

## Technical Details

- **CSS-only animations** (per project memory rule — no JS animation loops).
- Each flame uses 3 stacked SVG `<path>` elements with independent `animation-delay` and `animation-duration` so the flicker looks organic, not robotic.
- `will-change: transform, opacity` only on the flame layer to keep GPU usage low.
- `prefers-reduced-motion: reduce` → flames hold steady (accessibility).
- No new dependencies. No backend changes.

## Out of Scope

- Animating flames *inside* existing AI-generated cake photos (not technically possible without regenerating each image).
- If you later want the cake photos themselves to have animated flames, that would require either (a) regenerating cakes with transparent flame regions and overlaying SVG flames at fixed coordinates, or (b) generating short MP4/WebP loops per cake. Happy to plan that as a follow-up if desired.
