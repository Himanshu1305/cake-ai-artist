# Share Page Improvements

## 1. Share URL on production

The share link currently uses `window.location.origin`, so on preview it becomes `…lovableproject.com/cake/<id>`.

**Fix:** Hardcode `https://cakeaiartist.com` as the base for share URLs (everywhere we copy a `/cake/:id` link). Every newly copied link will then always be `https://cakeaiartist.com/cake/<id>`, regardless of which environment generated it.

## 2. Let the user choose which image is shared

Today only the first generated image is saved to `savedCakeImageId`, so the share link always points to image #1.

Changes in `src/components/CakeCreator.tsx`:
- Track `savedCakeImageIds: string[]` (one per saved image, parallel to `selectedImageUrls` / `generatedImages`).
- When the user selects/clicks a thumbnail (the existing checkmark UI), set `savedCakeImageId` to the saved row id of that image.
- "Copy share link" and the audio recorder both already key off `savedCakeImageId`, so they automatically follow the user's selection.
- Visual cue: highlight the currently-shared image with a small "Sharing this one" badge.

## 3. Beautify the `/cake/:id` page (`SharedCake.tsx`)

Rebuild the page into a celebratory landing experience using existing tokens (`party-pink`, `party-purple`, `party-cream`) — no new colors, no new deps:

- Animated gradient background (party-pink → party-purple → party-blue).
- Reuse `FloatingEmojis` + `ConfettiRain` for ambient celebration.
- One-time confetti burst on load (reuse `canvas-confetti`, already used in `SuccessCelebration.tsx`).
- Cake image: rounded card with soft glow ring, hover zoom, click → `ZoomableImage` modal.
- `CandleRow` above the image with a "Blow out the candles 🎂" button that triggers blow-out animation + confetti burst.
- Hero typography: large display script for the message, centered.
- Voice message: replace the plain `<audio>` with a styled play pill (large circular play, animated waveform bars while playing, duration chip).
- Sticky bottom CTA on mobile: "Make one for someone you love →" linking to `/`.
- Reuse `SocialShareButtons` so the recipient can re-share (WhatsApp, Pinterest, FB, X, Copy).
- Per-cake OG/meta tags (title = recipient name, image = cake image) for great WhatsApp/Twitter previews.
- Footer: "Made with Cake AI Artist" with link + tiny logo.

## 4. Replace the repetitive "For Von 🎂" heading

The cake image already shows the recipient's name, so repeating it as a heading feels flat.

Replace the heading block with:
- **Kicker chip** above the message: **"🎁 Someone special made this for you"** (small pill, party-pink/purple gradient text).
- The personal message becomes the hero text (large, script font, centered) — that carries the emotion.
- Optional small date stamp ("Sent May 13, 2026") under the message.

Net result: image carries the name visually, page copy carries the emotion.

## Technical notes

- Files touched:
  - `src/components/CakeCreator.tsx` — multi-image saved-id tracking + use hardcoded `https://cakeaiartist.com` base for share URL.
  - `src/pages/SharedCake.tsx` — visual rebuild, kicker chip, candles, confetti, styled voice player, OG meta tags, sticky CTA, social share buttons.
- No DB schema changes — image rows already exist per generated image; we just stop hard-pinning to the first.
- Reuses existing components: `ConfettiRain`, `FloatingEmojis`, `CandleRow`, `AnimatedFlame`, `ZoomableImage`, `SocialShareButtons`, `canvas-confetti`.
- All colors via semantic tokens (`party-*`, `primary`, `muted-foreground`).
