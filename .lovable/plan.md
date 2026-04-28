# Fix two homepage issues

## Issue 1 — Old page sometimes loads on refresh
**Cause:** Browser/CDN is caching `index.html`, so refreshes occasionally serve a stale build that still references old JS bundles. The new homepage redesign only appears when a fresh `index.html` is fetched.

**Fix:** Add cache-control meta tags in `index.html` to prevent the HTML shell from being cached. Hashed JS/CSS assets stay cacheable; only the entry HTML is forced to revalidate.

```html
<!-- in index.html <head> -->
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

This guarantees every refresh fetches the latest HTML, which loads the latest hashed bundles.

## Issue 2 — "See examples" goes to wrong page
**Current:** Button at `src/pages/Index.tsx:429` navigates to `/use-cases` (a marketing/copy page about use cases), not real cake images.

**Fix:** Change the click handler to navigate to `/community` — the Community Gallery page that displays AI-generated cake images (same images as "Recent Creations from Our Community" on the homepage, but a full browseable grid).

```tsx
// Index.tsx ~line 429
onClick={() => navigate('/community')}
```

## Files to edit
- `index.html` — add no-cache meta tags
- `src/pages/Index.tsx` — change "See examples" target route to `/community`

## Notes
- The runtime errors in the console (AdSense `availableWidth=0`, Firefox extension `e.features`) are unrelated third-party issues and not part of this fix.
- If stale loads persist after the meta-tag fix, the next step would be a hard service-worker / browser cache clear — but the meta tags resolve it for all future deploys.
