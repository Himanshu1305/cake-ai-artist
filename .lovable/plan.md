# Audio Greeting for Cakes

Let users record a short voice message (up to 30 seconds) and attach it to a generated cake. The audio plays on the public share page alongside the cake image, making the gift feel personal — a grandma's voice on a birthday cake link, a partner's anniversary note, etc.

---

## User Flow

1. After a cake is generated (or from the gallery card later), user sees a **"🎙️ Add voice message"** button.
2. Clicking opens a modal:
   - Mic permission prompt (with a friendly explainer if denied).
   - Big record button → recording timer (counts up to 30s, auto-stops at 30s).
   - Stop → playback with waveform + duration.
   - "Re-record" or "Save & attach" buttons.
3. On save, the audio uploads to storage and links to the cake.
4. Cake card shows a small **🔊 Voice message attached** badge with play/delete controls.
5. Share link / share card includes a play button so the recipient hears it on open.

---

## Scope

**In scope (v1):**
- Record, preview, save, replace, delete one audio clip per cake.
- Playback on owner's cake card and on the public cake share page.
- 30-second hard cap, ~500KB max file size.
- Works on Chrome, Safari (desktop + iOS 14.3+), Android Chrome, Firefox.

**Out of scope (later):**
- Multiple audio clips per cake.
- Audio waveform visualization (use simple HTML5 `<audio>` controls for v1; add wavesurfer later if wanted).
- AI voice cloning / TTS generation.
- Moderation tools (audio is only reachable via the share link — security through obscurity is acceptable for v1).

---

## Technical Plan

### 1. Database (migration)
Add to existing `generated_images` table (avoids new join):
- `audio_url TEXT NULL` — public URL of the audio file.
- `audio_duration_seconds INTEGER NULL` — for displaying duration without loading the file.

No new RLS needed — `generated_images` policies already cover owner read/write and admin read.

### 2. Storage (migration)
New public bucket `cake-audio`:
- Path convention: `{user_id}/{cake_id}.webm`
- RLS on `storage.objects`:
  - Public SELECT (so share link recipients can play it).
  - Authenticated INSERT/UPDATE/DELETE only on own folder (`auth.uid()::text = (storage.foldername(name))[1]`).
- File size limit: 1MB (enforced client-side; storage bucket also gets `file_size_limit`).
- Allowed mime types: `audio/webm`, `audio/mp4`, `audio/mpeg`.

### 3. New component: `AudioRecorder.tsx`
- Uses browser `MediaRecorder` API (no external library needed for v1).
- Detects best supported mime type (`audio/webm;codecs=opus` on Chrome/Firefox, `audio/mp4` on Safari/iOS).
- States: `idle → requesting-permission → recording → preview → uploading → done`.
- Uploads directly via `supabase.storage.from('cake-audio').upload(...)`.
- After upload, updates `generated_images.audio_url` + `audio_duration_seconds`.
- Handles permission denied with clear retry guidance.
- Disposes `MediaStream` tracks on unmount to release the mic.

### 4. Integration points
- **`CakeCreator.tsx`**: After successful cake save, show "🎙️ Add voice message" button that opens the recorder modal.
- **Cake card** (gallery / "My cakes"): If `audio_url` exists, show small player + "Replace" / "Remove" menu. If not, show "Add voice message".
- **Public share page** (the page reached from a share link): If `audio_url` exists, show a prominent play button under the cake image with "🎙️ A voice message from {sender}".
- **Share flow**: No change to URLs — audio rides along with the existing cake share link automatically.

### 5. UX details
- Recording UI uses brand party colors and a pulsing red dot during recording.
- Big mic icon, large hit target (mobile-friendly).
- Show estimated remaining seconds as a ring around the record button.
- Auto-stop with a soft chime + haptic buzz at 30s.
- Show file size after recording so user knows it's tiny (~150KB typical).

### 6. iOS Safari considerations
- iOS records as `audio/mp4` (AAC), not webm. Detect and use whichever the browser supports — both play universally.
- iOS requires user gesture to start recording (already handled — record button click is a gesture).
- Test on iOS 14.3+ (older versions don't support `MediaRecorder`).

---

## Difficulty & Estimate

**Difficulty: 4/10.** Mostly UI polish and storage wiring — no new backend logic, no edge functions, no AI calls.

**Estimated effort:** 2–3 focused build sessions:
1. Migration + storage bucket + RLS + `AudioRecorder` component (record/preview/upload).
2. Integration into CakeCreator + cake cards.
3. Public share page playback + cross-browser testing (especially iOS Safari).

---

## Open questions to confirm before building

1. **Where exactly should the "Add voice message" entry point appear?** Options:
   - Only right after cake creation (prominent celebration step).
   - Only on the cake card in the gallery.
   - Both. ← my recommendation.
2. **Free vs Premium feature?** Currently free tier is capped at 5 lifetime images. Should audio greetings be:
   - Free for everyone. ← my recommendation (drives shareability + virality).
   - Premium-only.
   - Free for 1 audio per user, premium for unlimited.
3. **Privacy default on share page**: should audio autoplay when the recipient opens the link, or require a tap on a play button? My recommendation: **require tap** (browsers block autoplay anyway, and a tap feels more intentional like opening a gift).
