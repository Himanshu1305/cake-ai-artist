import heroCake from "@/assets/hero-cake.jpg";
import { AnimatedFlame } from "./AnimatedFlame";

/**
 * Hero cake image with animated flame overlays.
 *
 * The baked-in flame pixels are masked with soft dark blobs (the bg behind
 * them is near-black, so masks blend invisibly), and animated SVG flames
 * are placed on top at each wick tip position.
 *
 * Coordinates are measured directly from the rendered preview crop of
 * src/assets/hero-cake.jpg (1200x800, 3:2). The image displays at its
 * natural 3:2 aspect.
 */

interface FlameSpec {
  x: number; // % from left of image (wick tip / flame base)
  y: number; // % from top of image (wick tip / flame base)
  delay: number;
  size: "sm" | "md" | "lg";
}

// Wick-top positions measured from a 626x418 rendered crop
const FLAMES: FlameSpec[] = [
  { x: 35.9, y: 27.5, delay: 0.0, size: "md" },  // back-left
  { x: 42.3, y: 22.7, delay: 0.3, size: "md" },
  { x: 47.1, y: 29.9, delay: 0.6, size: "md" },  // front (shorter wick)
  { x: 53.5, y: 25.1, delay: 0.15, size: "md" },
  { x: 59.9, y: 22.7, delay: 0.45, size: "md" }, // tallest
  { x: 66.3, y: 25.1, delay: 0.2, size: "md" },
  { x: 72.7, y: 26.3, delay: 0.5, size: "md" },  // back-right
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

      {/* Mask layer: dark blobs covering baked-in flames.
          Each mask is centered ~5% above the wick tip to fully cover the
          flame body, which extends roughly 8% upward from the wick. */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden">
        {FLAMES.map((f, i) => (
          <div
            key={`mask-${i}`}
            className="absolute"
            style={{
              left: `${f.x}%`,
              top: `${f.y - 5}%`,
              width: "6.5%",
              height: "14%",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(ellipse at center, rgba(20,12,6,0.99) 0%, rgba(20,12,6,0.95) 40%, rgba(20,12,6,0.6) 75%, transparent 100%)",
              filter: "blur(4px)",
            }}
          />
        ))}
      </div>

      {/* Animated flames layer: bottom anchored on each wick tip */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden">
        {FLAMES.map((f, i) => (
          <div
            key={`flame-${i}`}
            className="absolute"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
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
