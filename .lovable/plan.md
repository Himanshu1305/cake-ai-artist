## Audit result

I checked the current code, recent backend records, shared-page behavior, public audio files, database health, runtime errors, browser network behavior, and relevant web documentation for backend background tasks and audio compatibility.

Do I know what the issue is? Yes.

The core generation flow is improved, but I cannot honestly confirm all issues are fixed. Two are fixed or mostly fixed, and two still have real gaps.

## Issue-by-issue status

### 1. Only 1 image generated / stuck at 75%

Status: Partially fixed.

What is fixed:
- The app no longer depends on a single long-running request to return all images.
- A generation job is created and the frontend now polls/realtime-checks the job row.
- There are currently no stale `in_progress` jobs in the database.
- Recent backend health is normal: database is up, connection usage is low, memory is fine.

What is not fully fixed:
- Recent records still show partial generations. In the last 24 hours, 4 jobs completed with all 3 images, but 2 jobs ended as partial failures with only the top view filled.
- So the infinite 75% loading problem appears addressed, but the “all 3 images reliably appear without regenerate” problem is not fully solved.

Exact problem:
- The new backend function starts all 3 images in a background task and returns immediately.
- Web research confirms this pattern is valid, but background tasks still have hard wall-clock/runtime limits. If image calls are slow or return “No image returned,” the job can finish as partial instead of 3/3.
- The UI now shows placeholders/regenerate instead of getting stuck, but that is recovery, not true reliability.

### 2. Default selected/shared image logic

Status: Not fixed.

Current logic:
- The app auto-selects the first real image that appears.
- If the top-down image finishes first, it becomes selected by default.
- When saving, the first selected image becomes the active share target.
- If the user later selects multiple images, the share target can still remain whichever image was selected first.

Exact problem:
- The current behavior is based on generation arrival order, not product logic.
- That explains why top-down was selected/shared by default.
- There is no stable preference like “front/hero view should be the default share image.”

### 3. Spinning shared preview replaced with all-image animation

Status: Mostly fixed.

Confirmed:
- The shared page now uses `CakeConvergeReveal`, not the old spinning preview.
- I opened a recent shared cake link and confirmed the reveal shows the multi-image/final-card behavior.
- The final image no longer rotates; it only has a gentle vertical float, so the name/image should stay readable.

Remaining caveat:
- The reveal only shows multiple views if multiple sibling images were saved into the same share group.
- If only one image was selected/saved, the shared page only has one image and cannot show the 3-image converge idea.
- This connects back to Issue 2: default save/share selection can prevent the novel animation from showing all 3 views.

### 4. Voice message recorded but not audible from shared link

Status: Not fully fixed.

Confirmed:
- The latest voice file exists publicly and is reachable.
- The shared cake page renders a voice message player when the link points to the image row that has `audio_url`.
- I verified the audio object responds publicly with a valid audio content type.

Problems found:
1. Audio is attached to only one saved image row, not the whole share group.
   - In the latest saved 3-image group, only 1 of 3 image rows has the audio URL.
   - If the user copies/shares a sibling image link instead of that exact image row, the recipient gets no playable audio.

2. The recorded file format is currently WebM.
   - Web research shows WebM/Opus audio playback is unreliable on iOS/Safari and some in-app browsers.
   - That means even when the file exists, a recipient on iPhone/WhatsApp/Safari may not hear it.

3. The cookie popup can cover the shared page on mobile.
   - In the shared-link test, the cookie banner covered much of the message/player area.
   - This can make the recipient experience feel broken even if the audio player exists lower on the page.

Exact problem:
- Voice playback is not guaranteed because audio is row-specific and WebM is not universally playable.

## Runtime error check

The captured runtime error is from a browser extension script, not app code:
- `moz-extension://...content-end.ts.js`
- Message: `can't access property "features", e is undefined`

This is not the cause of cake generation or sharing failures.

## Recommended fix plan

### Step 1: Make generation completion stricter and more honest
- Keep the current job/polling model so the UI does not get stuck.
- Add stronger backend finalization logging and persist per-view failure details every time.
- Treat “partial with no explicit error” as a backend bug and always write a readable failure reason.
- Add a frontend “still rendering” timeout per slot, not a full-page stuck loader.

### Step 2: Make default sharing deterministic
- Default selected/share image should be the front/hero view, not whichever image arrives first.
- If the hero view is not ready yet, show placeholders but do not permanently select top-down just because it arrived first.
- When all 3 images are available, auto-select all real views for saving, or at minimum set the share target to the hero/front view.

### Step 3: Ensure the converge animation always has all available views
- When saving a cake batch, save all generated real views into the same share group, even if only one is the default share target.
- Keep the active shared image as the front/hero view.
- The shared page can still show all sibling images in the reveal, then finish on the selected/hero view.

### Step 4: Fix voice message sharing across all views
- When audio is recorded, attach the same audio URL to every image in the same share group, not only the current row.
- Update the public cake loader so if the selected row has no audio, it can fall back to audio from a sibling in the same share group.
- This prevents “wrong sibling link = no voice message.”

### Step 5: Make audio format recipient-safe
- Replace WebM-only recording with a more compatible recording path.
- Preferred robust fix: record/export short voice messages as WAV or another broadly playable format so iPhone/Safari/WhatsApp recipients can hear it.
- Keep existing WebM files playable where supported, but future recordings should use the safer format.

### Step 6: Reduce mobile shared-link obstruction
- On shared cake pages, make the cookie banner less intrusive or delay it until after the reveal/audio area is visible.
- This prevents the banner from covering the recipient’s first experience.

### Step 7: Validate with real checks
- Run one fresh generation and verify the job reaches a terminal state.
- Confirm 3 image URLs or explicit per-view errors are present.
- Save the cake and confirm the front/hero view is the default share target.
- Open the shared link and confirm the converge reveal shows all available sibling images.
- Record audio, open every sibling share link, and confirm the same audio is available.
- Test playback using a browser-compatible audio format path.

## Bottom line

Not all issues are fixed. The stuck-at-75% symptom is largely addressed, and the spinning preview has been replaced. But the default share-selection logic and voice-message sharing/playback still need targeted fixes before the core feature can be considered stable.

<presentation-actions>
  <presentation-open-history>View History</presentation-open-history>
</presentation-actions>

<presentation-actions>
<presentation-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</presentation-link>
</presentation-actions>