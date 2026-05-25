import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CakeConvergeRevealProps {
  /** All sibling images, primary first. 1–3 URLs. */
  images: string[];
  /** Final image shown after the reveal — the sender's selected view. */
  primary: string;
  alt?: string;
  className?: string;
  /** Storage key namespace so the same recipient doesn't see reveal twice. */
  cacheKey?: string;
}

/**
 * Cinematic "3 cakes converge into 1" reveal for the share page.
 * No 3D rotation on the final image — name/text stays crisp.
 */
export const CakeConvergeReveal = ({
  images,
  primary,
  alt = "Personalized cake",
  className = "",
  cacheKey,
}: CakeConvergeRevealProps) => {
  // Dedupe + cap at 3, ensure primary is included
  const uniq = Array.from(new Set([primary, ...images].filter(Boolean))).slice(0, 3);
  const hasTrio = uniq.length >= 2;

  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
  // 0 = idle/fade-in, 1 = cards fanned, 2 = converging, 3 = final reveal, 4 = idle float

  const skipKey = cacheKey ? `cake_reveal_seen_${cacheKey}` : null;

  useEffect(() => {
    // If only one image or already seen → skip to final
    if (!hasTrio || (skipKey && sessionStorage.getItem(skipKey))) {
      setPhase(4);
      return;
    }
    if (skipKey) sessionStorage.setItem(skipKey, "1");

    // Preload sibling images so they actually render during the fan-in
    uniq.forEach((src) => { const img = new Image(); img.src = src; });

    const t1 = setTimeout(() => setPhase(1), 400);    // fan in
    const t2 = setTimeout(() => setPhase(2), 5200);   // start converging (hold fanned ~4.8s)
    const t3 = setTimeout(() => setPhase(3), 6600);   // cross-fade to final
    const t4 = setTimeout(() => setPhase(4), 7600);   // idle float
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };

  }, [hasTrio, skipKey]);

  const handleSkip = () => setPhase(4);

  // Fanned positions for up to 3 cards — primary stays slightly back; side cards clearly visible
  const fanned = [
    { x: 0,    y: 0,    rot: 0,   z: 3, scale: 0.78 }, // center (primary), smaller so siblings show
    { x: -110, y: 30,   rot: -12, z: 2, scale: 0.7 },  // left sibling
    { x: 110,  y: 30,   rot: 12,  z: 1, scale: 0.7 },  // right sibling
  ];

  return (
    <div
      className={`relative mx-auto ${className}`}
      style={{ width: "min(100%, 360px)", aspectRatio: "1 / 1" }}
      onClick={handleSkip}
    >
      {/* Skip button — only during reveal */}
      {phase < 3 && hasTrio && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleSkip(); }}
          className="absolute top-2 right-2 z-30 bg-white/85 hover:bg-white backdrop-blur text-xs px-2.5 py-1 rounded-full shadow text-foreground/70"
        >
          Skip →
        </button>
      )}

      {/* Sparkle backdrop during reveal */}
      <AnimatePresence>
        {phase < 3 && hasTrio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-party-pink/15 via-party-purple/10 to-party-mint/15 blur-2xl -z-10"
          />
        )}
      </AnimatePresence>

      {/* Reveal: fanned cards that converge */}
      <AnimatePresence>
        {phase < 3 && hasTrio && (
          <motion.div
            key="trio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {uniq.map((src, i) => {
              const target = fanned[i] || fanned[0];
              const fanState = {
                x: phase >= 1 ? target.x : (i === 0 ? 0 : i === 1 ? -260 : 260),
                y: phase >= 1 ? target.y : (i === 0 ? -260 : 80),
                rotate: phase >= 1 ? target.rot : (i === 1 ? -25 : i === 2 ? 25 : -8),
                scale: phase >= 1 ? target.scale : 1,
                opacity: 1,
              };
              if (phase >= 2) {
                // converge to center; siblings fade out, primary scales up
                fanState.x = 0;
                fanState.y = 0;
                fanState.rotate = 0;
                fanState.scale = i === 0 ? 1 : 0.55;
                fanState.opacity = i === 0 ? 1 : 0;
              }
              return (
                <motion.img
                  key={src + i}
                  src={src}
                  alt={`${alt} view ${i + 1}`}
                  draggable={false}
                  loading="eager"
                  className="absolute top-1/2 left-1/2 w-[72%] aspect-square object-cover rounded-3xl shadow-[0_20px_50px_-15px_hsl(var(--party-purple)/0.55)] ring-2 ring-white/70"
                  style={{ translateX: "-50%", translateY: "-50%", zIndex: target.z }}
                  initial={{ x: i === 0 ? 0 : i === 1 ? -260 : 260, y: i === 0 ? -260 : 80, rotate: i === 1 ? -25 : i === 2 ? 25 : -8, scale: 0.85, opacity: 0 }}
                  animate={{
                    x: fanState.x,
                    y: fanState.y,
                    rotate: fanState.rotate,
                    scale: fanState.scale,
                    opacity: fanState.opacity,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 140,
                    damping: 22,
                    delay: phase === 0 ? i * 0.35 : 0,
                  }}
                />
              );
            })}

            {/* microcopy during fan */}
            {phase === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-xs font-medium text-foreground/70 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm whitespace-nowrap"
              >
                ✨ Picking the perfect view…
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final image — crisp, no rotation, gentle float */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: phase === 4 ? [0, -6, 0] : 0,
            }}
            transition={{
              opacity: { duration: 0.5 },
              scale: { type: "spring", stiffness: 220, damping: 18 },
              y: phase === 4
                ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0 },
            }}
            className="absolute inset-0"
          >
            <img
              src={primary}
              alt={alt}
              draggable={false}
              className="w-full h-full object-cover rounded-3xl shadow-[0_30px_60px_-20px_hsl(var(--party-pink)/0.55)] ring-1 ring-white/50"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
