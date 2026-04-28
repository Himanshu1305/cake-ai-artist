I agree this homepage image has to look polished, and the current separate overlay approach is too fragile. The better fix is to stop trying to position seven independent DOM flames over a baked-in photo and instead use one single pre-rendered animated hero asset where the flames are already composited into the image.

## Plan

1. Create a new animated hero image asset
   - Use the existing `src/assets/hero-cake.jpg` as the base.
   - Generate a looping animated WebP/GIF-style asset with subtle flickering flames already composited into the cake image.
   - The baked-in original flame areas will be covered inside the generated frames, then replacement flame shapes will be drawn in the exact same pixel positions.
   - Use the same 3:2 aspect ratio as the current hero image so the layout does not shift.

2. Replace the live overlay implementation
   - Update `HeroCakeWithFlames` so it renders the new animated image directly.
   - Remove the separate mask layer and seven separate `AnimatedFlame` overlays from the hero image.
   - Keep the same rounded corners, shadow, eager loading, and accessibility alt text.

3. Keep the animation reliable across screen sizes
   - Because the flicker is baked into the image itself, it will scale perfectly with the image on desktop, tablet, and mobile.
   - There will be no coordinate drift, no percentage-position mismatch, and no mask/overlay alignment issue.

4. Keep a fallback
   - If the browser cannot play the animated asset, keep the original static hero image as a fallback.
   - Prefer animated WebP for quality and smaller file size; GIF can be used only if needed, but WebP is usually much cleaner for this kind of photo.

5. QA visually before finishing
   - Check the homepage at the current viewport size.
   - Verify the animated flames sit exactly on the candles.
   - Verify no old flame halos peek through awkwardly.
   - Verify the image still looks premium and loads normally.

## Technical details

- Files to change:
  - `src/components/HeroCakeWithFlames.tsx`
  - Add a new generated asset under `src/assets/`, likely `hero-cake-animated.webp`
- Files likely no longer needed for the hero after this change:
  - `AnimatedFlame` can stay in the project if used elsewhere, but `HeroCakeWithFlames` will no longer depend on it.
- No backend or database changes are needed.

This approach is the most robust way to make the homepage look perfect: one image, one animation, no drifting overlays.