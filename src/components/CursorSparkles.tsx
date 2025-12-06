import { useEffect, useState, useRef } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const COLORS = [
  'hsl(315, 100%, 65%)', // party-pink
  'hsl(270, 100%, 75%)', // party-purple
  'hsl(45, 100%, 60%)',  // gold
  'hsl(15, 100%, 70%)',  // party-coral
  'hsl(150, 60%, 70%)',  // party-mint
];

const MAX_SPARKLES = 20;

export const CursorSparkles = () => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const nextIdRef = useRef(0);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  useEffect(() => {
    let lastSparkleTime = 0;
    const sparkleInterval = 50;

    const createSparkle = (x: number, y: number) => {
      const id = nextIdRef.current++;
      const duration = Math.random() * 600 + 400;
      const delay = Math.random() * 100;

      const sparkle: Sparkle = {
        id,
        x,
        y,
        size: Math.random() * 8 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        duration,
        delay,
      };

      setSparkles(prev => {
        const newSparkles = prev.length >= MAX_SPARKLES 
          ? [...prev.slice(1), sparkle] 
          : [...prev, sparkle];
        return newSparkles;
      });

      const timeout = setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== id));
        timeoutsRef.current.delete(timeout);
      }, duration + delay);
      
      timeoutsRef.current.add(timeout);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSparkleTime > sparkleInterval) {
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        createSparkle(e.clientX + offsetX, e.clientY + offsetY);
        lastSparkleTime = now;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []); // Empty dependency array - no stale closure issues now

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="absolute animate-sparkle-fade"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            animationDuration: `${sparkle.duration}ms`,
            animationDelay: `${sparkle.delay}ms`,
          }}
        >
          <svg
            width={sparkle.size}
            height={sparkle.size}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 0L12.2451 7.75486L20 10L12.2451 12.2451L10 20L7.75486 12.2451L0 10L7.75486 7.75486L10 0Z"
              fill={sparkle.color}
              opacity="0.9"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};
