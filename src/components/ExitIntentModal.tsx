import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check, X } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { SpotsRemainingCounter } from "./SpotsRemainingCounter";

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

  const benefits = [
    { smart: "Pay $49 once ✅", expensive: "Pay $156/year ❌" },
    { smart: "Never pay again", expensive: "Forever" },
    { smart: "= $49 total", expensive: "= $1,560 over 10yrs" },
  ];

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-2xl bg-background/95 border-destructive/50 border-4 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center">
              <X className="inline w-8 h-8 text-destructive mr-2" />
              WAIT! Before you go...
            </DialogTitle>
            <DialogDescription className="text-center text-lg pt-2">
              You're 30 seconds away from missing the ONLY lifetime deal we'll EVER offer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            {/* Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface-elevated rounded-xl p-6 border-2 border-border"
            >
              <h3 className="font-bold text-center mb-4 text-lg">Which Would You Choose?</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gold/20 to-party-pink/20 border-2 border-gold rounded-lg p-4">
                  <p className="font-bold text-gold mb-2 text-center">Option A (Smart) ✅</p>
                  {benefits.map((b, i) => (
                    <p key={i} className="text-sm mb-1">{b.smart}</p>
                  ))}
                </div>
                <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-4">
                  <p className="font-bold text-destructive mb-2 text-center">Option B (Expensive) ❌</p>
                  {benefits.map((b, i) => (
                    <p key={i} className="text-sm mb-1 text-muted-foreground">{b.expensive}</p>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Urgency Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg border border-border">
                <span className="font-semibold">⏰ Sale ends:</span>
                <CountdownTimer compact />
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg border border-border">
                <span className="font-semibold">🎯 Spots left at $49:</span>
                <SpotsRemainingCounter tier="tier_1_49" />
              </div>
              <div className="p-4 bg-gold/10 rounded-lg border border-gold/30 text-center">
                <p className="font-bold text-gold text-lg">💰 Your savings: $1,509 FOREVER</p>
              </div>
            </motion.div>

            {/* Warning Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-4"
            >
              <p className="text-center font-semibold mb-2">This offer disappears January 1st.</p>
              <p className="text-center text-sm text-muted-foreground">
                ❌ No extensions. ❌ No repeats. ❌ No exceptions.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <Button
                onClick={handleUpgrade}
                className="w-full py-6 text-lg bg-gradient-gold hover:shadow-gold font-bold"
              >
                <Crown className="w-5 h-5 mr-2" />
                Get Lifetime Access - $49
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
              >
                No thanks, I'll pay $156/year instead
              </Button>
            </motion.div>

            {/* Final Push */}
            <p className="text-xs text-center text-muted-foreground italic">
              Still thinking? Spots are being claimed right now...
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
