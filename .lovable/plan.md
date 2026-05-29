# Fix "error then disappears" on page load

## Root cause

After a new deploy, the previously cached `index.html` references old hashed chunk filenames (e.g. `IndiaLanding-B3_-1MKG.js`, `party-hero-CTCVHVUE.js`). When the user navigates, `React.lazy(() => import(...))` fails with `TypeError: error loading dynamically imported module` / `NetworkError when attempting to fetch resource`. The `ErrorBoundary` catches it and renders the red "Something went wrong" screen — then SPA navigation re-mounts and it disappears. This is visible in the console logs and matches exactly the symptom the user describes.

This is unrelated to the country page, India copy, or schema work — it's a build/deploy artifact issue and will keep happening on every release until handled.

## Fix

Two small, surgical changes — no UI/behavior changes for the happy path.

### 1. Add a `lazyWithRetry` helper (new file `src/lib/lazyWithRetry.ts`)

Wrap `React.lazy` so that when a dynamic `import()` fails with a chunk-load error, we:
- retry once after a short delay (handles transient network blips), then
- if it still fails, do a **one-time** hard reload of the page (using a `sessionStorage` flag so we never loop). After reload the browser fetches the new `index.html` with the current chunk hashes and the page loads cleanly.

This is the standard Vite/CRA pattern for handling stale chunks post-deploy.

### 2. Use it in `src/App.tsx`

Replace every `lazy(() => import("./pages/..."))` with `lazyWithRetry(() => import("./pages/..."))`. No other changes to routing or Suspense fallback.

### 3. Harden `ErrorBoundary` (`src/components/ErrorBoundary.tsx`)

As a safety net: in `componentDidCatch`, if the error message matches the chunk-load pattern (`error loading dynamically imported module` / `Failed to fetch dynamically imported module` / `ChunkLoadError`), trigger the same one-shot reload instead of rendering the error UI. Non-chunk errors continue to show the existing fallback so real bugs stay visible.

## Outcome

- No more flash of the red error screen on first navigation after a deploy.
- Real runtime errors still surface in `ErrorBoundary` as before.
- Zero changes to page content, styling, or business logic.
