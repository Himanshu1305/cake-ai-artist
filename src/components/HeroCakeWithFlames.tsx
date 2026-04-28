import heroCake from "@/assets/hero-cake.jpg";
import { AnimatedFlame } from "./AnimatedFlame";

/**
 * Hero cake image with animated flame overlays.
 *
 * The baked-in flame pixels are masked with soft dark blobs (the bg behind
 * them is near-black, so masks blend invisibly), and animated SVG flames
 * are placed on top at each candle wick position.
 *
 * Positions are tuned for src/assets/hero-cake.jpg (1200x800, 3:2).
 * Container preserves the natural 3:2 aspect to keep coordinates stable.
 */

interface FlameSpec {
  x: number; // % from left of image
  y: number; // % from top of image (this is the flame TIP)
  delay: number;
  size: "sm" | "md" | "lg";
}

// Flame TIP positions in the 1200x800 source
const FLAMES: FlameSpec[] = [
  { x: 33.8, y: 13.8, delay: 0.0, size: "md" },
  { x: 41.3, y: 11.9, delay: 0.3, size: "md" },
  { x: 48.3, y: 18.1, delay: 0.6, size: "md" },
  { x: 55.0, y: 13.8, delay: 0.15, size: "md" },
  { x: 60.4, y: 13.1, delay: 0.45, size: "md" },
  { x: 65.8, y: 12.5, delay: 0.2, size: "md" },
  { x: 73.3, y: 13.1, delay: 0.5, size: "md" },
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

      {/* Overlay layer matches image bounds exactly */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden">
        {FLAMES.map((f, i) => (
          <div key={i}>
            {/* Dark mask hiding the baked-in flame.
                Centered slightly below the tip so it covers the full flame body. */}
            <div
              className="absolute"
              style={{
                left: `${f.x}%`,
                top: `${f.y + 1.6}%`,
                width: "5.5%",
                height: "10%",
                transform: "translate(-50%, -40%)",
                background:
                  "radial-gradient(ellipse at center, rgba(10,8,6,0.96) 0%, rgba(10,8,6,0.85) 40%, rgba(10,8,6,0.45) 75%, transparent 100%)",
                filter: "blur(2.5px)",
              }}
            />
            {/* Animated flame anchored at the wick tip */}
            <div
              className="absolute"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                transform: "translate(-50%, -55%)",
              }}
            >
              <AnimatedFlame size={f.size} delay={f.delay} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
