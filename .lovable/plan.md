## Goal
Make the candle flames on the hero cake image (`src/assets/hero-cake.jpg`) flicker like real burning candles.

## Approach
Overlay animated SVG flames on top of the static hero image, with small dark masks hiding the baked-in flame pixels (the background behind those flames is near-black, so masks blend invisibly).

## Changes

### 1. New: `src/components/HeroCakeWithFlames.tsx`
- Renders the hero `<img>` inside a `relative` container
- Tuned config of 7 flame positions (x%, y%, delay) matching the wicks in `hero-cake.jpg`
- Per-candle dark radial-gradient mask hides baked-in flame
- Per-candle `<AnimatedFlame />` (already built) sits at the wick tip with staggered flicker delays
- Preserves existing classes: `rounded-3xl shadow-elegant ring-1 ring-gold/30 aspect-square md:aspect-[4/5]`

### 2. Edit: `src/pages/Index.tsx` (around line 458)
Replace the plain `<img src={heroCake} … />` with `<HeroCakeWithFlames className="…" />`. Keep the surrounding `motion.div`, glow halo, and `animate-float` wrapper untouched.

## Caveats
- Positions are hand-tuned for this one image. May need 1 round of nudging.
- If you ever swap `hero-cake.jpg`, positions must be re-tuned.
- No new dependencies, no CSS changes, no backend.
