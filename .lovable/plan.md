## Diagnosis

1. **Refresh flash is from `index.html`, not React**
   - The screenshot that appears first is the static pre-React fallback inside `index.html`.
   - It was added for fast first paint/LCP, but its design and layout no longer match the real homepage, so users see a visibly different page for a few seconds until React loads.

2. **Fast generation was accidentally changed to High Quality behavior**
   - Current backend code uses one unified “hero-first + background views” path for **both Fast and High Quality**.
   - That is why Fast now returns only the front view first and leaves side/top as “in progress”.
   - Your expectation is correct: **Fast should generate all 3 views together and return all 3 together**. The hero-first progressive flow should be used only for High Quality.

3. **Side/top background failures are real image-generation soft failures**
   - Recent job data shows one failed generation with `side_error = No image returned` and `top_error = No image returned`.
   - The manual regenerate working after retry confirms the model/gateway can produce those views, but the current background path accepts partial failure too easily.

## Fix plan

### 1. Remove the mismatched refresh flash
- Replace the current large static fallback in `index.html` with a minimal branded loading shell that visually matches the real theme and does not pretend to be the homepage.
- Keep it lightweight for performance, but avoid showing the old hero/title screen that then changes underneath the user.

### 2. Restore Fast mode to synchronous 3-view generation
- In `generate-complete-cake`, split behavior by quality:
  - **Fast**: generate front/side/top together using `Promise.allSettled`, return all real successful images in the same response.
  - **High Quality**: keep the safer hero-first + background job flow.
- Do not create `cake_generation_jobs` rows for normal Fast generation unless Fast has a partial failure that needs recovery.

### 3. Make Fast more reliable without reverting to 98% forever
- Keep partial-success handling, but change Fast rules:
  - If all 3 Fast views succeed: show all 3 immediately.
  - If 1 view fails: show the successful views and a clear retry prompt for the missing slot.
  - If 2+ views fail: treat it as a generation failure and ask the user to retry, because Fast is expected to deliver a complete set.
- Keep specific error messages for credits, rate limit, auth/session, and service failures.

### 4. Keep High Quality progressive only
- High Quality continues to return the first view early, then fills side/top via realtime/polling.
- High Quality placeholders and “views need retry” behavior stay available because that mode is intentionally slower and more detailed.

### 5. Fix frontend messaging and state rules
- Update `CakeCreator.tsx` so:
  - Fast toast says all views are being generated now.
  - Fast does not show the persistent “background views rendering” banner after a successful complete response.
  - High Quality keeps the “first view appears, rest stream in” copy.
  - Placeholder slots are still never saved to gallery.

### 6. Validate after implementation
- Deploy/test the `generate-complete-cake` function for:
  - Fast decorated cake: expect 3 images in initial response.
  - High Quality decorated cake: expect first image + jobId + background slots.
  - Regenerate top view: expect a single returned image.
- Confirm refresh no longer shows the mismatched old homepage shell.