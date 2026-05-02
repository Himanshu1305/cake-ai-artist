## Plan: Fix Runtime Errors

### Error 1: `adsbygoogle.push() error: No slot size for availableWidth=0`

**Root cause:** `AdSlot` calls `adsbygoogle.push({})` as soon as `adsEnabled`, `slotId`, and consent are true. At that moment the `<ins>` element can still have `availableWidth = 0` because:
- The ad sits inside a container that hasn't laid out yet (e.g. a collapsed `Suspense` fallback, deferred mount, sidebar that's `hidden md:block`, or a tab not yet visible).
- The effect runs before the browser has assigned a width to the parent.

**Fix in `src/components/AdSlot.tsx`:**
1. Before pushing, measure `adRef.current.offsetWidth`. If it's `0`, defer using a `ResizeObserver` (with a `requestAnimationFrame` fallback) and only push once width > 0.
2. Wrap the push in stronger try/catch and only set `adInitialized.current = true` if push actually succeeded, so a failed/early push can be retried when the container becomes visible.
3. Disconnect the observer on cleanup / once initialized.

This eliminates the AdSense `availableWidth=0` runtime error without changing any visual or business behavior.

### Error 2: `can't access property "features", e is undefined`

**Root cause:** The stack trace points to `moz-extension://3ce21877-1199-49f2-8406-632cd90bf98e/content-end.ts.js` — this is a **Firefox browser extension** (likely an ad blocker, password manager, or shopping helper) running in the user's browser. It is not our code and is not loaded from our site.

**Fix:** Nothing to change in the codebase — we cannot patch a third-party extension. I'll note this in the response so the user knows it's safe to ignore (or reproducible only when that extension is installed). Optional: confirm by asking the user to test in a private window with extensions disabled.

### Files to edit
- `src/components/AdSlot.tsx` — add width-aware deferred push using `ResizeObserver`.

### Out of scope
- The browser-extension error (not fixable from our side).
- The unrelated security findings shown in the security panel.
