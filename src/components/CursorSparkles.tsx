import { useEffect, useState, useCallback } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

export const CursorSparkles = () => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [nextId, setNextId] = useState(0);

  const colors = [
    'hsl(315, 100%, 65%)', // party-pink
    'hsl(270, 100%, 75%)', // party-purple
    'hsl(45, 100%, 60%)',  // gold
    'hsl(15, 100%, 70%)',  // party-coral
    'hsl(150, 60%, 70%)',  // party-mint
  ];

  const createSparkle = useCallback((x: number, y: number) => {
    const sparkle: Sparkle = {
      id: nextId,
      x,
      y,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 600 + 400,
      delay: Math.random() * 100,
    };

    setSparkles(prev => [...prev, sparkle]);
    setNextId(prev => prev + 1);

    // Remove sparkle after animation
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => s.id !== sparkle.id));
    }, sparkle.duration + sparkle.delay);
  }, [nextId, colors]);

  useEffect(() => {
    let lastSparkleTime = 0;
    const sparkleInterval = 50; // Create sparkle every 50ms when moving

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSparkleTime > sparkleInterval) {
        // Add some randomness to position for natural effect
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        createSparkle(e.clientX + offsetX, e.clientY + offsetY);
        lastSparkleTime = now;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [createSparkle]);

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
          {/* Star sparkle */}
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
