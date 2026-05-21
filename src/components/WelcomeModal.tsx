import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface WelcomeModalProps {
  userId: string | null;
  onStart: (occasion: string, name: string) => void;
  onSkip: () => void;
}

const WelcomeModal = ({ onStart, onSkip }: WelcomeModalProps) => {
  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState("");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-background rounded-2xl shadow-2xl border-2 border-party-pink/30 max-w-md w-full p-8 text-center"
        >
          <div className="text-6xl mb-4">🎂</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome to Cake AI Artist!
          </h2>
          <p className="text-muted-foreground mb-6">
            You have 5 free cake designs. Let's make your first one right now — it takes 30 seconds.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            <div className="space-y-1">
              <Label htmlFor="welcome-name" className="text-sm font-medium">
                Who is this cake for?
              </Label>
              <Input
                id="welcome-name"
                placeholder="e.g. Sarah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-party-pink/30 focus:border-party-pink"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="welcome-occasion" className="text-sm font-medium">
                What's the occasion?
              </Label>
              <Input
                id="welcome-occasion"
                placeholder="e.g. Birthday"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="border-party-pink/30 focus:border-party-pink"
              />
            </div>
          </div>

          <Button
            size="lg"
            className="w-full bg-gradient-party text-white text-lg py-6 hover:opacity-90 mb-4"
            onClick={() => onStart(occasion.trim(), name.trim())}
          >
            Create My First Cake 🎂
          </Button>

          <button
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip — I'll explore on my own
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WelcomeModal;
