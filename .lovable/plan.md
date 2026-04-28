## Root cause

My previous coordinate measurements from the source asset were wrong. By measuring directly from the rendered preview (a clean 626×418 crop of the actual hero image as displayed), the wick tops are at **y ≈ 22-30%**, not 14-21%. So all my animated flames were rendering ~10% of image-height ABOVE the wicks, in the dark space — leaving the original baked-in flames fully visible.

A second issue: even the masks weren't big enough to cover real flames had they been correctly placed. Real flames span ~7-8% of image height each; masks need to be at least that tall and fully centered on the flame body (not the wick tip).

## Fix

Edit `src/components/HeroCakeWithFlames.tsx`:

### 1. Corrected wick-tip coordinates (measured from rendered preview)

```ts
const FLAMES = [
  { x: 35.9, y: 27.5, delay: 0.0,  size: "md" },  // back-left
  { x: 42.3, y: 22.7, delay: 0.3,  size: "md" },
  { x: 47.1, y: 29.9, delay: 0.6,  size: "md" },  // front (shorter candle, lower wick)
  { x: 53.5, y: 25.1, delay: 0.15, size: "md" },
  { x: 59.9, y: 22.7, delay: 0.45, size: "md" },  // tallest
  { x: 66.3, y: 25.1, delay: 0.2,  size: "md" },
  { x: 72.7, y: 26.3, delay: 0.5,  size: "md" },  // back-right
];
```

### 2. Bigger, taller masks fully covering each real flame

Each real flame body extends ~8% upward from the wick tip. Mask should:
- Be ~6.5% wide × ~14% tall (taller than current 12%)
- Be centered ~5% above the wick tip (so it covers the full flame body, not just the base)
- Use a near-opaque core (rgba 0.99) with strong blur so edges blend into the dark backdrop
- Use the image's actual dark background color (very dark warm brown ~rgb(20,12,6)) instead of pure black for seamless blending

```ts
// mask centered at (f.x, f.y - 5%), 6.5% × 14%
background: "radial-gradient(ellipse at center, rgba(20,12,6,0.99) 0%, rgba(20,12,6,0.95) 40%, rgba(20,12,6,0.6) 75%, transparent 100%)",
filter: "blur(4px)",
```

### 3. Keep flame anchoring at wick tip

`translate(-50%, -100%)` so animated flame's bottom sits on the wick tip — already correct.

## Files

- **Edit only**: `src/components/HeroCakeWithFlames.tsx` — replace `FLAMES` array, bump mask size and tweak gradient color/blur.

No other files. No CSS, no backend.