## Issue 1 — Top view not last

**No code change needed.** Database confirms `sibling_image_urls` already returns `[primary, ...siblings by created_at]`, so the `finale = last sibling` logic in `SharedCake.tsx` correctly settles on the top view. The reason `cakeaiartist.com` still shows the old behavior is that the last frontend change hasn't been published. After this plan ships, click **Publish → Update** so the custom domain serves the new build. No need to recreate the cake.

## Issue 2 — Sound doesn't auto-start

Chrome, Safari and iOS block Web Audio until a user gesture. The current page waits silently for any tap/scroll, so most recipients never hear the jingle. We'll replace the silent black "Opening your cake..." overlay with a **big tappable splash** — the tap is the gesture that unlocks audio AND kicks off the reveal, so sound and animation truly start together.

### Changes to `src/pages/SharedCake.tsx`

1. **Gate the reveal on a tap.** Add `const [opened, setOpened] = useState(false)`. The existing staged-reveal effect (lines 84–100) and the visibility/safety fallbacks only run once `opened === true`. Until then, `revealStage` stays `0` and the page sits on the splash.

2. **Redesign the stage-0 overlay** (lines 320–334) into a celebratory splash:
   - Warm gradient (party-pink / party-purple / party-mint) instead of black-to-gray, matching the brand.
   - Large bouncing 🎂 emoji, sender's name chip ("Chanchal made this just for you 💝") if available.
   - Prominent pulsing CTA button: **"Tap to open your cake 🎂"**.
   - Subtext: *"Turn up your volume 🔊"*.
   - Clicking anywhere on the overlay (or the button) calls `handleOpen()`:
     - `setOpened(true)` → triggers the staged reveal effect.
     - `startJingleIfNeeded()` synchronously inside the click handler — this is the gesture that unlocks `AudioContext`.
     - Also pre-resumes `jingleRef.current` audio context before scheduling notes (already handled in `BirthdayJingle.play`).

3. **Remove the now-redundant first-interaction listener** (lines 152–165) since the splash button is the guaranteed first interaction. Keep `startJingleIfNeeded` for the mute-toggle and replay paths.

4. **Replay button** continues to work — it already calls into the same `startJingleIfNeeded` chain and the audio context is unlocked after the initial splash tap.

### Verification

- Preview: open `/cake/dd6956a2-...` → see splash → tap → cake card animates in, jingle plays immediately, sequence shows front → side → **top** as the final image.
- Replay button still restarts the 3-view sequence cleanly.
- Mute icon still works.
- After merging, hit **Publish → Update** so `cakeaiartist.com` serves the fix.

### Files touched

- `src/pages/SharedCake.tsx` — splash overlay, opened state, gesture-driven jingle start.

No backend, schema, or other component changes.
