interface AnimatedFlameProps {
  size?: "sm" | "md" | "lg";
  delay?: number; // seconds
  className?: string;
}

const sizeMap = {
  sm: { w: 14, h: 22 },
  md: { w: 20, h: 32 },
  lg: { w: 28, h: 44 },
};

/**
 * Pure CSS/SVG animated candle flame.
 * - Outer orange flame: slow flicker
 * - Inner yellow core: faster flicker + sway
 * - Warm halo: gentle pulse
 * Each instance accepts a `delay` so a row of candles flickers out of sync.
 */
export const AnimatedFlame = ({ size = "md", delay = 0, className = "" }: AnimatedFlameProps) => {
  const { w, h } = sizeMap[size];

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: w, height: h }}
      aria-hidden="true"
    >
      {/* Warm halo */}
      <div
        className="absolute rounded-full flame-halo"
        style={{
          width: w * 2.4,
          height: w * 2.4,
          left: w / 2 - (w * 2.4) / 2,
          top: h / 2 - (w * 2.4) / 2,
          background:
            "radial-gradient(circle, hsl(45 100% 65% / 0.55) 0%, hsl(30 100% 55% / 0.25) 40%, transparent 70%)",
          animationDelay: `${delay}s`,
        }}
      />

      {/* Outer orange flame */}
      <svg
        viewBox="0 0 20 32"
        width={w}
        height={h}
        className="absolute inset-0 flame-outer"
        style={{ animationDelay: `${delay}s` }}
      >
        <path
          d="M10 1 C 14 8, 18 13, 18 20 C 18 27, 14 31, 10 31 C 6 31, 2 27, 2 20 C 2 13, 6 8, 10 1 Z"
          fill="url(#flameOuterGrad)"
        />
        <defs>
          <linearGradient id="flameOuterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(15 100% 60%)" />
            <stop offset="60%" stopColor="hsl(30 100% 55%)" />
            <stop offset="100%" stopColor="hsl(45 100% 50%)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Inner yellow core */}
      <svg
        viewBox="0 0 20 32"
        width={w}
        height={h}
        className="absolute inset-0 flame-inner"
        style={{ animationDelay: `${delay + 0.15}s` }}
      >
        <path
          d="M10 8 C 12.5 13, 14.5 17, 14.5 22 C 14.5 27, 12 29, 10 29 C 8 29, 5.5 27, 5.5 22 C 5.5 17, 7.5 13, 10 8 Z"
          fill="url(#flameInnerGrad)"
        />
        <defs>
          <linearGradient id="flameInnerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(50 100% 85%)" />
            <stop offset="60%" stopColor="hsl(45 100% 70%)" />
            <stop offset="100%" stopColor="hsl(35 100% 60%)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
