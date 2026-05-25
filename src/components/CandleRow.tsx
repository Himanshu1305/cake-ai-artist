import { AnimatedFlame } from "./AnimatedFlame";

interface CandleRowProps {
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  blown?: boolean;
}

const candleHeights = [38, 44, 50, 56, 50, 44, 38];

export const CandleRow = ({ count = 7, size = "md", className = "", blown = false }: CandleRowProps) => {
  const candles = Array.from({ length: count });
  const stickWidth = size === "sm" ? 4 : size === "md" ? 6 : 8;

  return (
    <div
      className={`flex items-end justify-center gap-3 md:gap-4 ${className}`}
      aria-hidden="true"
    >
      {candles.map((_, i) => {
        const heightIdx = i % candleHeights.length;
        const stickHeight =
          (candleHeights[heightIdx] * (size === "sm" ? 0.7 : size === "lg" ? 1.2 : 1));
        const delay = ((i * 0.37) % 1.4) - 0.7;

        return (
          <div key={i} className="flex flex-col items-center">
            <AnimatedFlame size={size} delay={delay} blown={blown} />
            <div
              className="rounded-sm shadow-sm transition-all duration-500"
              style={{
                width: stickWidth,
                height: stickHeight,
                background: blown
                  ? "linear-gradient(180deg, hsl(40 30% 55%) 0%, hsl(35 25% 45%) 50%, hsl(30 20% 38%) 100%)"
                  : "linear-gradient(180deg, hsl(45 80% 60%) 0%, hsl(40 75% 50%) 50%, hsl(35 70% 42%) 100%)",
                marginTop: -2,
                boxShadow:
                  "inset -1px 0 0 hsl(35 60% 35% / 0.5), inset 1px 0 0 hsl(50 90% 75% / 0.5)",
                filter: blown ? "saturate(0.5)" : undefined,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
