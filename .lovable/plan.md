## Problem

In the current preview, the animated flames are floating in the dark space **above** the cake, while the original baked-in flames are still clearly visible sitting on the candle wicks. Two issues are stacking:

1. **Animated flames are translated too far up.** The current `translate(-50%, -55%)` pushes each flame ~18px above its tip coordinate, so they end up above the real flames instead of replacing them.
2. **Masks are too small and offset wrong.** Current mask is only `5.5% × 10%` of the image and centered slightly *above* the flame, so the original flames stay visible.

## Fix

Rewrite the overlay logic in `src/components/HeroCakeWithFlames.tsx`:

### 1. Re-map coordinates from the actual image
Use **wick-tip coordinates** (where the wick ends and the flame begins), not flame-tip coordinates. From inspection of `hero-cake.jpg` (1200×800), the 7 wick tops are approximately:

| # | x %  | wick-top y % | notes |
|---|------|--------------|-------|
| 1 | 35.0 | 21           | back-left |
| 2 | 41.5 | 18           | |
| 3 | 47.0 | 26           | front, shorter candle |
| 4 | 54.0 | 19           | |
| 5 | 60.0 | 18           | tallest |
| 6 | 66.0 | 19           | |
| 7 | 73.0 | 20           | back-right |

### 2. Anchor the animated flame at the wick tip
Change transform from `translate(-50%, -55%)` to `translate(-50%, -100%)` so the flame's **bottom** sits on the wick tip (matching how a real flame attaches to a wick).

### 3. Make masks bigger and properly placed
Each mask should fully cover the original flame, which extends roughly from the wick tip upward by ~7–9% of image height. Use:
- Width: ~7% of image
- Height: ~12% of image
- Anchor: centered on `(x, y - 4%)` — i.e. above the wick tip, covering the flame body
- Stronger gradient core (opacity 0.98) and slightly larger blur (3px) for a clean blend with the dark background

### 4. Layer ordering
Render mask layer first, then animated flames on top. Keep the existing `pointer-events-none` and `overflow-hidden rounded-3xl`.

## Verification

After implementing, the animated flames should appear directly on top of the wicks, and the original flames should be invisible (blended into the dark background).

If after this round any single flame is still slightly off, only minor per-candle nudges will be needed (1–2% adjustments).

## Files

- **Edit**: `src/components/HeroCakeWithFlames.tsx` — update `FLAMES` config, mask size/position, flame transform.

No other files affected. No new dependencies, no CSS changes, no backend.