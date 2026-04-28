## Problem

The animated hero image `src/assets/hero-cake-animated.webp` was generated with **19 frames but no per-frame duration metadata** (every frame has `duration=None`, totaling 0ms). Browsers can't play a 0ms animation, so they freeze on frame 0 — that's why the flames look static even though the file is technically "animated."

## Fix

Regenerate the same animated WebP, but this time write an explicit frame duration so browsers actually loop the animation.

### Steps

1. Re-run the flame compositing script with the same 7 flame coordinates already validated:
   `(425, 155), (501, 130), (555, 195), (608, 140), (670, 155), (715, 140), (790, 165)`
2. Generate ~16 frames of subtle warm radial-glow flicker over those coordinates (varying glow size, opacity, slight color shift between amber/yellow per frame for an organic flicker).
3. Save with PIL using:
   - `save_all=True`
   - `append_images=frames[1:]`
   - `duration=80` (ms per frame -> ~12 fps, smooth flame flicker)
   - `loop=0` (infinite)
   - `lossless=False`, `quality=85`, `method=6` (good size/quality tradeoff)
4. Verify after writing: re-open the file and assert each frame's `duration` is set and `n_frames > 1`.
5. Visually QA on the homepage at the user's current viewport (1071x772) to confirm the flames now flicker.

### Files touched

- `src/assets/hero-cake-animated.webp` — regenerated with valid frame durations
- No component changes needed; `HeroCakeWithFlames.tsx` already renders this asset

### Why this will work

The current asset is the right approach (single composited image, no overlay drift). It just lacks the timing metadata that tells the browser when to advance frames. Adding `duration=80` per frame is a one-line fix to the generation script and produces a properly looping animated WebP.
