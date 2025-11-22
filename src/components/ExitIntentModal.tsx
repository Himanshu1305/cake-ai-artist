import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";

interface ExitIntentModalProps {
  isLoggedIn: boolean;
  isPremium: boolean;
}

export const ExitIntentModal = ({ isLoggedIn, isPremium }: ExitIntentModalProps) => {
  const [showModal, setShowModal] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const navigate = useNavigate();

  useEffect(() => {
    // Don't show for premium users
    if (isPremium || hasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Detect when mouse leaves through the top of the viewport
      if (e.clientY <= 0 && !hasShown) {
        setShowModal(true);
        setHasShown(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isPremium, hasShown]);

  useEffect(() => {
    if (showModal && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showModal, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleUpgrade = () => {
    setShowModal(false);
    navigate("/auth");
  };

  const premiumFeatures = [
    "Unlimited cake generations",
    "Access to all premium characters (Spider-Man, Elsa, Goku & more)",
    "Save all your cake designs",
    "Priority generation speed",
    "Download in high resolution",
    "Remove watermarks",
    "Early access to new features",
  ];

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md bg-background/95 border-party-purple/30 border-2 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <motion.div
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Crown className="w-6 h-6 text-yellow-500" />
              </motion.div>
              Wait! Don't Miss Out! 🎉
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Unlock unlimited magical cakes with Premium!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <motion.div 
              className="bg-gradient-party/10 rounded-lg p-4 border border-party-pink/30"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.05, duration: 0.3 }}
                  >
                    <Check className="w-5 h-5 text-party-pink flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: [1, 1.05, 1] }}
              transition={{ delay: 0.5, duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
            >
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                🔥 30% OFF Expires in: {formatTime(timeLeft)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This special offer won't last long!
              </p>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Button
                onClick={handleUpgrade}
                className="w-full py-6 text-lg bg-gradient-party hover:shadow-party transition-all duration-300 transform hover:scale-[1.02]"
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Premium Now
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                variant="ghost"
                className="w-full"
              >
                Maybe later
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
