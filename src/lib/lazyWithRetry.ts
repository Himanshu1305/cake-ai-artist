import { lazy, ComponentType } from "react";

const RELOAD_KEY = "lazy-retry-reloaded";

const isChunkLoadError = (error: unknown): boolean => {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  return /loading (dynamically imported module|chunk)|Failed to fetch dynamically imported module|ChunkLoadError|Importing a module script failed/i.test(
    msg
  );
};

/**
 * Wraps React.lazy to recover from stale chunk errors after a deploy.
 * - Retries the import once after a short delay.
 * - If it still fails, performs a one-shot hard reload so the browser
 *   re-fetches index.html with current chunk hashes.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      if (!isChunkLoadError(error)) throw error;

      // Retry once after a brief pause for transient network blips.
      try {
        await new Promise((r) => setTimeout(r, 400));
        return await factory();
      } catch (retryError) {
        if (!isChunkLoadError(retryError)) throw retryError;

        // One-shot hard reload to pick up the new index.html / chunks.
        try {
          const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY);
          if (!alreadyReloaded) {
            sessionStorage.setItem(RELOAD_KEY, "1");
            window.location.reload();
            // Return a never-resolving promise to keep Suspense in fallback
            // until the reload happens.
            return await new Promise<{ default: T }>(() => {});
          }
        } catch {
          // sessionStorage unavailable — fall through and rethrow.
        }
        throw retryError;
      }
    }
  });
}

// Clear the reload flag once the app has successfully loaded a chunk after reload.
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    try {
      sessionStorage.removeItem(RELOAD_KEY);
    } catch {
      /* noop */
    }
  });
}
