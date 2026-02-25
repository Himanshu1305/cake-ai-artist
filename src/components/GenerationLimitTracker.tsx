import { Progress } from "@/components/ui/progress";
import { Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface GenerationLimitTrackerProps {
  current: number;
  limit: number;
  isPremium: boolean;
}

export const GenerationLimitTracker = ({ current, limit, isPremium }: GenerationLimitTrackerProps) => {
  const navigate = useNavigate();
  const percentage = (current / limit) * 100;
  const remaining = limit - current;

  if (isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-party-purple/20 to-party-pink/20 border border-party-purple/30 rounded-lg p-4 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-party-purple" />
            <span className="text-foreground font-medium">Premium Active</span>
          </div>
          <span className="text-muted-foreground text-sm">{current} cakes this year</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-elevated border border-border rounded-lg p-4 mb-6"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-foreground font-medium">Free Generations</span>
        <span className="text-foreground text-sm">
          {remaining}/{limit} remaining
        </span>
      </div>
      
      <Progress value={percentage} className="h-2 mb-3" />
      
      {remaining <= 1 && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3"
        >
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              {remaining === 0 ? "You've used all free generations" : "Last free generation!"}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Upgrade for unlimited creations
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate("/pricing")}
            className="bg-party-purple hover:bg-party-purple/90 gap-1"
          >
            <Zap className="h-3 w-3" />
            Upgrade
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
