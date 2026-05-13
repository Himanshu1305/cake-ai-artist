## Restore audio recorder visibility + tighten form layout

### 1. Audio recording — not removed, just hidden behind a gate

The `AudioRecorder` component, state, and entire UI block are still present in `CakeCreator.tsx` (lines 2481–2569). It only renders when **all three** are true:
- user is logged in
- a cake has been saved to the gallery (`savedCakeImageId` is set)
- the saved cake row exists with the user's id

That's why it looks gone — most users won't have saved yet when they expect to see it. Two-part fix:

**a) Add an always-visible teaser** right after the "Save to Gallery" button (before the gated block):
- Small inline callout: "🎙️ Want to add a voice message? Save to gallery first — then record up to 30s for the recipient."
- Only shown when `isLoggedIn && !savedCakeImageId && generatedImages.length > 0`.
- For logged-out users, show: "🎙️ Sign in & save to add a voice message to your cake link."

**b) Once saved, scroll the audio block into view** automatically (smooth scroll to its ref) so the user immediately sees the new voice-message option appear. Avoids the "did anything happen?" confusion.

No backend changes — the existing flow (save first, then attach audio) stays intact since `audio_url` lives on the `generated_images` row.

### 2. Compact form — put paired controls on the same line

**File: `src/components/CakeCreator.tsx`**

- **Generation Quality (lines ~1800–1853)**: change `grid-cols-1 gap-2` → `grid-cols-1 sm:grid-cols-2 gap-2`. Fast and High Quality cards sit side-by-side from the `sm` breakpoint up. Trim the High-Quality "Creates more detailed…" helper text into the inline label (or move to a tooltip) so both cards stay equal height.

- **Section padding tightening**: reduce vertical padding on the "Customize Your Cake" card from `space-y-3 md:space-y-4 p-3 md:p-4` to a slightly tighter rhythm (`space-y-3 p-3 md:p-4`) so the section header + quality toggle + 4-up grid feel like one block, not three.

- **Confirm existing pairs**: Cake Type/Layers/Theme/Colors are already in a `grid-cols-1 md:grid-cols-2` grid (line 1856) and Recipient Name / Occasion Date are already paired (line 1941) — no change needed; they already render side-by-side on `md+`.

- **Mobile (current viewport 946px is `md`)**: all the above pairs already collapse on mobile; the change only adds horizontal pairing on wider screens, no mobile regressions.

### Out of scope
- No changes to backend, generation flow, or audio storage.
- No changes to the CharacterPicker, photo upload, or "Save as Memory" sections (already paired).
- AdSense `availableWidth=0` and Firefox extension errors in the console are unrelated to this request and not caused by app code.

### Verification
- After a generation completes while logged out: teaser line appears under the gallery save area.
- After a generation completes while logged in but unsaved: teaser appears prompting to save first.
- After saving to gallery: teaser disappears, AudioRecorder block appears and the page smooth-scrolls to it.
- On a ≥640px viewport: Fast and High-Quality buttons render side-by-side; on <640px they stack as before.
- No layout overflow or text clipping in either Fast/High-Quality card after the side-by-side change.
