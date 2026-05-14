# You are right to be frustrated

This should not keep getting a different patch every day.

The reason it keeps happening is that the earlier fixes improved symptoms around the same fragile flow, but did not fully remove the fragile flow:

```text
Browser waits for AI image generation request
progress timer reaches 98%
backend/API is slow, interrupted, rate-limited, or returns no image
UI looks stuck
```

So the real issue is not the number 98. The issue is that cake creation still depends too much on a long AI request finishing perfectly.

# Final direction — no more bandaids

I will treat this as one root-cause reliability fix, not another UI tweak.

## What will change

### 1. Stop relying on a long browser request
Cake creation will become job-based.

The user clicks generate, the app creates a generation job immediately, and the UI tracks that job until images are ready.

### 2. Keep completed images even if one view fails
If front view succeeds but side/top fails, the user still gets the successful cake image.

Only the failed slot gets a retry button.

### 3. Make every failure visible
No silent 98% state.

The UI will show one of these clear states:

- Queued
- Creating main cake
- Creating side view
- Creating top view
- Ready
- Needs retry
- Credits/rate limit issue
- Network interrupted

### 4. Use the supported Lovable AI Gateway pattern
The current function manually calls the AI gateway. I will move it to the recommended server-side Lovable AI Gateway SDK pattern so errors and routing are more reliable.

### 5. Add durable recovery
If the page reloads, the browser disconnects, or the preview refreshes, the app will fetch the latest active job and resume instead of losing the generation.

# What I will not do

- I will not keep changing the fake progress percentage as the main fix.
- I will not add another cosmetic loading workaround.
- I will not change blog, recipe, SEO, or cake spin features as part of this fix.
- I will not discard successful generated images just because one image slot failed.

# Result

AI providers can still occasionally fail because of rate limits, credits, or upstream outages, but the app will no longer leave users stuck at 98% with no explanation.

The app will either show the cake, show partial results with retry, or show the exact reason it cannot continue.