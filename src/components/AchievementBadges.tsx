import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Flame, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface Achievement {
  type: string;
  title: string;
  description: string;
  icon: JSX.Element;
}

const ACHIEVEMENTS: Record<string, Achievement> = {
  first_cake: {
    type: "first_cake",
    title: "First Steps",
    description: "Created your first cake!",
    icon: <Star className="h-6 w-6" />,
  },
  party_planner_10: {
    type: "party_planner_10",
    title: "Party Planner",
    description: "Created 10 amazing cakes",
    icon: <Trophy className="h-6 w-6" />,
  },
  celebration_master_50: {
    type: "celebration_master_50",
    title: "Celebration Master",
    description: "Created 50 cakes! You're on fire!",
    icon: <Award className="h-6 w-6" />,
  },
  week_streak_7: {
    type: "week_streak_7",
    title: "Week Warrior",
    description: "7-day creation streak!",
    icon: <Flame className="h-6 w-6" />,
  },
};

interface AchievementBadgesProps {
  userId: string;
  totalGenerations: number;
  currentStreak: number;
}

export const AchievementBadges = ({ userId, totalGenerations, currentStreak }: AchievementBadgesProps) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState<Achievement | null>(null);

  useEffect(() => {
    loadAchievements();
    checkNewAchievements();
  }, [totalGenerations, currentStreak]);

  const loadAchievements = async () => {
    const { data } = await supabase
      .from("achievements")
      .select("achievement_type")
      .eq("user_id", userId);

    if (data) {
      setUnlockedAchievements(data.map((a) => a.achievement_type));
    }
  };

  const checkNewAchievements = async () => {
    const toUnlock: string[] = [];

    if (totalGenerations >= 1 && !unlockedAchievements.includes("first_cake")) {
      toUnlock.push("first_cake");
    }
    if (totalGenerations >= 10 && !unlockedAchievements.includes("party_planner_10")) {
      toUnlock.push("party_planner_10");
    }
    if (totalGenerations >= 50 && !unlockedAchievements.includes("celebration_master_50")) {
      toUnlock.push("celebration_master_50");
    }
    if (currentStreak >= 7 && !unlockedAchievements.includes("week_streak_7")) {
      toUnlock.push("week_streak_7");
    }

    for (const type of toUnlock) {
      await unlockAchievement(type);
    }
  };

  const unlockAchievement = async (type: string) => {
    try {
      const { error } = await supabase.from("achievements").insert({
        user_id: userId,
        achievement_type: type,
      });

      if (error) return; // Already unlocked

      setUnlockedAchievements((prev) => [...prev, type]);
      const achievement = ACHIEVEMENTS[type];
      
      setShowNotification(achievement);
      toast({
        title: `Achievement Unlocked! 🎉`,
        description: `${achievement.title} - ${achievement.description}`,
      });

      setTimeout(() => setShowNotification(null), 5000);
    } catch (error) {
      console.error("Error unlocking achievement:", error);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 right-6 z-50"
          >
            <Card className="p-6 bg-gradient-to-br from-gold to-gold-muted border-2 border-gold shadow-gold">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: 3, duration: 0.5 }}
                className="flex items-center gap-4"
              >
                <div className="p-3 bg-white/20 rounded-full text-white">
                  {showNotification.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Achievement Unlocked!</h3>
                  <p className="text-white/90 text-sm">{showNotification.title}</p>
                  <p className="text-white/70 text-xs">{showNotification.description}</p>
                </div>
              </motion.div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {unlockedAchievements.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {unlockedAchievements.map((type) => {
            const achievement = ACHIEVEMENTS[type];
            if (!achievement) return null;
            
            return (
              <motion.div
                key={type}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="p-2 bg-gold/20 border border-gold/30 rounded-lg text-gold"
                title={`${achievement.title} - ${achievement.description}`}
              >
                {achievement.icon}
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
};
