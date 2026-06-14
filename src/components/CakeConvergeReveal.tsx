import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CakeConvergeRevealProps {
  /** All sibling images, primary first. 1–3 URLs. */
  images: string[];
  /** Sender's selected view — shown first in the reveal sequence. */
  primary: string;
  /** Image to settle on at the end. Defaults to primary. */
  finale?: string;
  alt?: string;
  className?: string;
  /** Storage key namespace so the same recipient doesn't see reveal twice. */
  cacheKey?: string;
  /** When false, holds at primary and does not run the sequence. */
  enabled?: boolean;
}

const PER_IMAGE_MS = 2000;
const MERGE_MS = 900;
const FADE_S = 0.35;

/**
 * Simple, clear reveal: shows the sender's selected (primary) view first,
 * then the other angles, then settles on primary. Always plays — no
 * sessionStorage skip, because the reveal IS the share-link payoff.
 */
export const CakeConvergeReveal = ({
  images,
  primary,
  finale,
  alt = "Personalized cake",
  className = "",
  cacheKey,
  enabled = true,
}: CakeConvergeRevealProps) => {
  const finalImage = finale && images.includes(finale) ? finale : primary;
  // Primary first, then other distinct angles, ending on finale.
  const middle = images.filter((u) => u && u !== primary && u !== finalImage).slice(0, 1);
  const seqRaw = primary === finalImage
    ? [primary, ...images.filter((u) => u && u !== primary).slice(0, 2)]
    : [primary, ...middle, finalImage];
  const sequence = Array.from(new Set(seqRaw)).slice(0, 3);
  const hasMultiple = sequence.length >= 2;

  // -1 = idle/preloading, 0..n-1 = showing image i, n = merging/final
  const [step, setStep] = useState<number>(-1);
  const [ready, setReady] = useState(false);

  // Stable hash of sequence URLs so preload re-runs when images themselves
  // change (e.g., a sibling slot fills in after mount).
  const sequenceKey = sequence.join("|");

  // Preload images — only once enabled (e.g., after recipient taps splash)
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    if (sequence.length === 0) return;
    setReady(false);
    let loaded = 0;
    sequence.forEach((src) => {
      const img = new Image();
      const done = () => {
        loaded += 1;
        if (!cancelled && loaded >= sequence.length) setReady(true);
      };
      img.onload = done;
      img.onerror = done;
      img.src = src;
    });
    // Safety fallback so we never get stuck
    const safety = setTimeout(() => { if (!cancelled) setReady(true); }, 2500);
    return () => { cancelled = true; clearTimeout(safety); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, cacheKey, sequenceKey]);

  // Run sequence — only once enabled and preload finished
  useEffect(() => {
    if (!enabled) return;
    if (!ready) return;
    if (!hasMultiple) {
      setStep(sequence.length);
      return;
    }
    setStep(0);
    const timers: number[] = [];
    for (let i = 1; i <= sequence.length; i++) {
      timers.push(window.setTimeout(() => setStep(i), i * PER_IMAGE_MS));
    }
    return () => { timers.forEach(clearTimeout); };
  }, [enabled, ready, hasMultiple, sequence.length]);

  const handleSkip = () => setStep(sequence.length);
  const inSequence = step >= 0 && step < sequence.length;
  const showFinal = step >= sequence.length;

  return (
    <div
      className={`relative mx-auto ${className}`}
      style={{ width: "min(100%, 360px)", aspectRatio: "1 / 1" }}
    >
      {/* Skip button — only during reveal */}
      {inSequence && hasMultiple && (
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-2 right-2 z-30 bg-white/85 hover:bg-white backdrop-blur text-xs px-2.5 py-1 rounded-full shadow text-foreground/70"
        >
          Skip →
        </button>
      )}

      {/* Sparkle backdrop during reveal */}
      <AnimatePresence>
        {inSequence && hasMultiple && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-party-pink/15 via-party-purple/10 to-party-mint/15 blur-2xl -z-10"
          />
        )}
      </AnimatePresence>

      {/* Sequential image reveal — one large image at a time */}
      <AnimatePresence mode="wait">
        {inSequence && (
          <motion.img
            key={`seq-${step}-${sequence[step]}`}
            src={sequence[step]}
            alt={`${alt} view ${step + 1}`}
            draggable={false}
            loading="eager"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: FADE_S, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-[0_20px_50px_-15px_hsl(var(--party-purple)/0.55)] ring-2 ring-white/70"
          />
        )}
      </AnimatePresence>

      {/* Caption during sequence */}
      {inSequence && hasMultiple && (
        <motion.div
          key={`cap-${step}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-xs font-medium text-foreground/80 bg-white/85 backdrop-blur px-3 py-1 rounded-full shadow-sm whitespace-nowrap"
        >
          ✨ View {step + 1} of {sequence.length}
        </motion.div>
      )}

      {/* Final image — crisp, gentle float */}
      <AnimatePresence>
        {showFinal && (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
            transition={{
              opacity: { duration: MERGE_MS / 1000 },
              scale: { type: "spring", stiffness: 220, damping: 18 },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute inset-0"
          >
            <img
              src={finalImage}
              alt={alt}
              draggable={false}
              className="w-full h-full object-cover rounded-3xl shadow-[0_30px_60px_-20px_hsl(var(--party-pink)/0.55)] ring-1 ring-white/50"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state while images preload */}
      {!ready && step === -1 && (
        <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-muted/40 backdrop-blur-sm">
          <div className="h-8 w-8 border-4 border-party-pink border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
