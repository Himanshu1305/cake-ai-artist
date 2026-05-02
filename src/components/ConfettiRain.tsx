import { useMemo } from "react";

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
  width: number;
  height: number;
  shape: "rect" | "circle";
}

const COLORS = [
  "hsl(315 88% 62%)", // party-pink
  "hsl(270 85% 72%)", // party-purple
  "hsl(45 90% 58%)",  // party-gold
  "hsl(15 90% 68%)",  // party-coral
  "hsl(150 55% 68%)", // party-mint
  "hsl(30 90% 60%)",  // party-orange
];

interface ConfettiRainProps {
  count?: number;
}

export const ConfettiRain = ({ count = 14 }: ConfettiRainProps) => {
  const pieces: Piece[] = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 5 + Math.random() * 4,
      rotate: Math.random() * 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      width: 6 + Math.random() * 6,
      height: 8 + Math.random() * 10,
      shape: Math.random() > 0.7 ? "circle" : "rect",
    }));
  }, [count]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${p.left}%`,
            width: `${p.width}px`,
            height: `${p.height}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "9999px" : "2px",
            transform: `rotate(${p.rotate}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
};
