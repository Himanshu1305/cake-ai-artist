import { useEffect, useState, type ReactNode } from "react";

interface DeferredMountProps {
  children: ReactNode;
  /** Fallback delay in ms if requestIdleCallback is unavailable */
  delay?: number;
  /** Optional idle timeout */
  idleTimeout?: number;
}

/**
 * Renders children only after the browser is idle (or after `delay` ms),
 * keeping initial paint fast without changing functionality.
 */
export const DeferredMount = ({
  children,
  delay = 1500,
  idleTimeout = 3000,
}: DeferredMountProps) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const reveal = () => {
      if (!cancelled) setReady(true);
    };

    const ric: any = (window as any).requestIdleCallback;
    let handle: any;
    let timeoutId: any;

    if (typeof ric === "function") {
      handle = ric(reveal, { timeout: idleTimeout });
    } else {
      timeoutId = setTimeout(reveal, delay);
    }

    return () => {
      cancelled = true;
      const cic: any = (window as any).cancelIdleCallback;
      if (handle && typeof cic === "function") cic(handle);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [delay, idleTimeout]);

  if (!ready) return null;
  return <>{children}</>;
};
