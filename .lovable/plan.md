# Fix: shared-link reveal too fast + confirm jingle for all occasions

## What's happening today

**Reveal animation** (`src/components/CakeConvergeReveal.tsx`):
- `PER_IMAGE_MS = 2000` — each image is *scheduled* every 2s.
- But each image also has a 0.55s enter + 0.55s exit transition (`framer-motion`, `mode="wait"`). With `mode="wait"` the next image waits for the previous to exit, so the visible "settled" time per image is closer to ~0.9s, not 2s. That's why the first two views feel like a flash.

**Jingle** (`src/pages/SharedCake.tsx` lines 115–125):
- Already branches: `birthday` → Happy Birthday melody, all other occasions → `celebration` fanfare. Mute button is wired. This part is actually working — I'll just double-check the occasion detection covers empty/unknown cases.

## Fix

### 1. Slow the reveal so each early image is clearly visible ≥2s

In `src/components/CakeConvergeReveal.tsx`:

- Bump `PER_IMAGE_MS` from `2000` → `2600` so that even after the 0.55s cross-fade, each image sits fully opaque for ~2s.
- Shorten the enter/exit transitions from `0.55` → `0.35` so the image reaches full opacity faster and the perceived "hold" time grows.
- Keep the existing "Skip →" button so impatient viewers aren't punished.

Net effect per image: ~0.35s fade-in + ~1.9s hold + ~0.35s fade-out, which the user reads as "shown for about 2 seconds".

Final merge timing (`MERGE_MS = 900`) and the floating animation on the final image stay unchanged.

### 2. Jingle coverage (verify only, no behavior change unless needed)

In `src/pages/SharedCake.tsx` `startJingleIfNeeded`:
- Current rule: `isBirthday = occ.includes("birth") || occ === "bday" || occ === ""` → birthday melody; everything else → celebration fanfare.
- This already covers anniversary, wedding, graduation, eid, etc. with the celebration tune. No code change needed.
- If you'd like a different default for unknown/empty occasion (e.g. celebration instead of birthday), say so and I'll flip that one line.

## Files touched

- `src/components/CakeConvergeReveal.tsx` — change `PER_IMAGE_MS` constant and the two `transition={{ duration: 0.55, ... }}` values on the sequence `motion.img`.

No backend, route, share-link, or jingle-engine changes.

## Verification

1. Open a shared cake link with 3 generated views → first image fully visible ~2s, then second ~2s, then final image lands and floats.
2. Skip button still works mid-sequence.
3. Birthday cake → Happy Birthday plays after first tap; mute toggles silence.
4. Non-birthday cake (e.g. anniversary) → celebration fanfare plays; mute toggles silence.
