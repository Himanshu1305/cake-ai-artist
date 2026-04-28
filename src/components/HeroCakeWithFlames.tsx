import heroCake from "@/assets/hero-cake.jpg";
import { AnimatedFlame } from "./AnimatedFlame";

/**
 * Hero cake image with animated flame overlays.
 *
 * The baked-in flame pixels are masked with soft dark blobs (the bg behind
 * them is near-black, so masks blend invisibly), and animated SVG flames
 * are placed on top at each wick tip position.
 *
 * Positions are tuned for src/assets/hero-cake.jpg (1200x800, 3:2).
 * Container preserves the natural 3:2 aspect to keep coordinates stable.
 */

interface FlameSpec {
  x: number; // % from left of image (wick tip / flame base)
  y: number; // % from top of image (wick tip / flame base)
  delay: number;
  size: "sm" | "md" | "lg";
}

// Wick-top positions (where flame attaches to wick) in the 1200x800 source
const FLAMES: FlameSpec[] = [
  { x: 36.7, y: 17.5, delay: 0.0, size: "md" },
  { x: 43.3, y: 14.4, delay: 0.3, size: "md" },
  { x: 47.1, y: 21.3, delay: 0.6, size: "md" },
  { x: 53.8, y: 16.9, delay: 0.15, size: "md" },
  { x: 60.4, y: 18.1, delay: 0.45, size: "md" },
  { x: 65.8, y: 16.3, delay: 0.2, size: "md" },
  { x: 72.9, y: 17.5, delay: 0.5, size: "md" },
];

interface Props {
  className?: string;
  alt?: string;
}

export const HeroCakeWithFlames = ({
  className = "",
  alt = "AI-designed celebration cake with animated candle flames",
}: Props) => {
  return (
    <div className={`relative ${className}`}>
      <img
        src={heroCake}
        alt={alt}
        className="relative block w-full h-auto rounded-3xl shadow-elegant ring-1 ring-gold/30"
        loading="eager"
      />

      {/* Mask layer: dark blobs covering baked-in flames */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden">
        {FLAMES.map((f, i) => (
          <div
            key={`mask-${i}`}
            className="absolute"
            style={{
              left: `${f.x}%`,
              // Center mask above the wick tip, covering the flame body
              top: `${f.y - 4}%`,
              width: "7%",
              height: "12%",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(ellipse at center, rgba(8,6,5,0.98) 0%, rgba(8,6,5,0.92) 35%, rgba(8,6,5,0.6) 70%, transparent 100%)",
              filter: "blur(3px)",
            }}
          />
        ))}
      </div>

      {/* Animated flames layer: anchored bottom-center on each wick tip */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden">
        {FLAMES.map((f, i) => (
          <div
            key={`flame-${i}`}
            className="absolute"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              // Bottom of the flame sits exactly on the wick tip
              transform: "translate(-50%, -100%)",
            }}
          >
            <AnimatedFlame size={f.size} delay={f.delay} />
          </div>
        ))}
      </div>
    </div>
  );
};
