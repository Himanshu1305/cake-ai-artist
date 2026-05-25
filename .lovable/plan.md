## Plan

1. **Replace the current fan reveal with a clear 3-step image reveal**
   - Show image 1 clearly for 2 seconds.
   - Show image 2 clearly for 2 seconds.
   - Show image 3 clearly for 2 seconds.
   - Then merge/converge into the final selected cake image.
   - Preload all reveal images before starting so side/alternate images do not appear blank.
   - Update replay to rerun the same full sequence instead of the shorter old timing.

2. **Fix the voice message play button**
   - Make the visible voice play button trigger the same native audio element that currently works in the fallback player.
   - Remove the fragile hidden-source setup that is causing the first button to fail while the fallback works.
   - Load/reset the audio directly on click, then call `play()` from that user gesture.
   - Keep the native controls as a fallback, but avoid showing an error if only the custom button had a recoverable issue.

3. **Pause background music while voice audio plays**
   - On voice play: explicitly stop/pause the background jingle, not just lower volume.
   - On voice end/pause: resume background music only if it is not muted and if the user has already interacted with the page.

4. **Add a visible mute/unmute option where users can see it**
   - Keep the floating mute button, but make it more obvious with text like “Mute music” / “Music muted”.
   - Place it in the visible shared-card area near the voice/cake controls so it is not missed at the top-right edge.
   - Ensure it controls both birthday music and generic celebration music.

5. **Tighten state and timing conflicts**
   - Remove the duplicate shared-page reveal stage timers from `SharedCake.tsx` that conflict with `CakeConvergeReveal` timing.
   - Let `CakeConvergeReveal` own the image animation timing.
   - Keep the outer card/message reveal simple and delayed enough that the 3-image sequence is visible.

## Files to update

- `src/components/CakeConvergeReveal.tsx`
- `src/pages/SharedCake.tsx`
- Potentially `src/utils/birthdayJingle.ts` only if the current class needs a clearer pause/resume helper

## Validation

- Replay shows each of the 3 images for about 2 seconds before merging.
- The custom voice play button plays the same audio that works in the fallback player.
- Background music stops while voice audio is playing and only resumes afterward if unmuted.
- The mute option is visible in the card area and controls the music state.