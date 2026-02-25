

## Plan: Improve Cake Card Presentation and Remove Share Text

### Changes

**1. Remove "Check out this amazing cake" share text**

**File: `src/components/CakeCreator.tsx`** (lines 1158, 1168-1172)
- Change `shareText` to just `${name}'s Birthday Cake 🎂`
- In `navigator.share()`, set `title` to the short label and **remove the `text` field entirely** so no extra promotional text appears below the shared image on mobile

**File: `src/pages/Gallery.tsx`** (line 138)
- Remove `"Check out this amazing personalized cake! 🎂✨"` — replace with a minimal label like `"Personalized Cake 🎂"`

**2. Fix wasted space / black bars in shareable card**

**File: `src/components/CakeCreator.tsx`** — `createShareableImage` function (lines 961-1073)
- Currently draws the full AI-generated image preserving its aspect ratio, which includes black bars at top/bottom
- Change to **center-crop** (like CSS `object-cover`): use the 9-argument `drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)` to crop the source image to fill the full 1080px width at a 4:5 or 1:1 aspect ratio, eliminating black padding
- Remove the background gradient fill since the image will fill edge-to-edge with no visible background

**3. Tighten image grid display**

**File: `src/components/CakeCreator.tsx`** (lines 2137, 2231, 2317)
- Change `aspect-square` to `aspect-[4/5]` on image containers so the displayed grid matches the shareable card proportions and shows more of the cake without excessive cropping

### Files Changed

| File | Change |
|------|--------|
| `src/components/CakeCreator.tsx` | Remove share text, crop black bars in shareable image, adjust grid aspect ratio |
| `src/pages/Gallery.tsx` | Remove promotional share text |

### Impact
- No backend changes. Pure frontend/cosmetic improvements.
- Shared images will look tighter and more professional with no black bars and no promotional text.

