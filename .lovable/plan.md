I’ll fix all six shared-card issues in one build, focused on the public cake page, reveal animation, recorder upload metadata, and the public cake data function.

## What I’ll change

1. **Make all three cake images visible during reveal**
   - Update the reveal animation so the side images are larger, less hidden behind the main image, and held on screen longer.
   - Preload sibling images before starting the fan animation so they don’t appear blank/late.
   - Keep the final selected cake crisp and centered after the reveal.

2. **Fix voice message playback more reliably**
   - Store the recorded audio MIME type with the audio URL.
   - Return that MIME type from the public cake function.
   - Use explicit `<source type="...">` on the shared page so Safari/iOS and other browsers decode the file correctly.
   - Improve the recorder preview by not using a hidden audio element for preview playback and by surfacing playback errors.
   - Keep native audio controls visible as a reliable fallback.

3. **Use birthday tune only for birthday cakes**
   - Detect birthday occasions from `occasion_type`.
   - Use the current Happy Birthday melody only for birthday cakes.
   - Add a separate generic celebration melody for anniversary/other occasions.
   - Keep the same start/stop/ducking behavior with voice playback.

4. **Make smoke clearly visible after candles are blown**
   - Increase smoke size, contrast, duration, and vertical travel.
   - Add multiple wisps per candle with clearer placement above the candle tips.
   - Ensure container overflow does not clip the smoke.

5. **Mute background music option**
   - Keep/add a persistent music mute toggle.
   - Make it clearer and ensure it controls both birthday and generic celebration background music.

6. **Show creator name instead of generic message**
   - Strengthen the sender-name lookup in the public cake function by using profile first name, full profile name, and auth metadata fallback where available.
   - On the page, only show the generic “Someone special...” fallback if no creator name exists at all.
   - Update the bottom attribution to use the same resolved creator name.

## Technical scope

- Frontend: `SharedCake.tsx`, `CakeConvergeReveal.tsx`, `AudioRecorder.tsx`, `CandleRow.tsx`, `AnimatedFlame.tsx`, `birthdayJingle.ts`, `index.css`.
- Backend migration: add `audio_mime_type` to `generated_images` and update `get_public_cake` to return `audio_mime_type` plus a stronger `sender_name`.
- No changes to cake generation prompts or core image creation flow.

## Validation

- Verify the reveal uses 2–3 images and the side images are visible before convergence.
- Verify the shared page audio element uses the stored MIME type and native fallback remains available.
- Verify birthday vs non-birthday music routing.
- Verify candle smoke is visually obvious after clicking “Blow out the candles”.
- Verify sender chip uses the resolved creator name when available.