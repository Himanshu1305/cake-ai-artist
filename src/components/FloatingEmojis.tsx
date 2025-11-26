import { useEffect, useState } from "react";

interface Emoji {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
}

export const FloatingEmojis = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  useEffect(() => {
    const celebrationEmojis = ['🎈', '🎊', '✨', '🎂', '🎉', '🎁', '🌟', '💫', '🎀', '🍰'];
    
    const generateEmojis = () => {
      const newEmojis: Emoji[] = [];
      for (let i = 0; i < 15; i++) {
        newEmojis.push({
          id: i,
          emoji: celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)],
          left: Math.random() * 100,
          delay: Math.random() * 5,
          duration: 8 + Math.random() * 4,
        });
      }
      setEmojis(newEmojis);
    };

    generateEmojis();
    const interval = setInterval(generateEmojis, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="absolute text-4xl opacity-70 animate-float-up"
          style={{
            left: `${emoji.left}%`,
            animationDelay: `${emoji.delay}s`,
            animationDuration: `${emoji.duration}s`,
          }}
        >
          {emoji.emoji}
        </div>
      ))}
    </div>
  );
};
