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
import { Crown, Check, Sparkles } from "lucide-react";

const EXIT_MODAL_KEY = 'exit_modal_last_shown';
const MODAL_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

const hasShownRecently = (): boolean => {
  const last = localStorage.getItem(EXIT_MODAL_KEY);
  if (!last) return false;
  return Date.now() - parseInt(last) < MODAL_COOLDOWN_MS;
};

const markShown = (): void => {
  localStorage.setItem(EXIT_MODAL_KEY, Date.now().toString());
};

interface ExitIntentModalProps {
  isLoggedIn: boolean;
  isPremium: boolean;
  isPremiumInactive?: boolean;
  country?: string;
}

const LIFETIME_PRICES: Record<string, string> = {
  IN: "₹2,999",
  GB: "£49",
  CA: "C$69",
  AU: "A$79",
  US: "$49",
};
const YEARLY_PRICES: Record<string, string> = {
  IN: "₹1,999/yr",
  GB: "£29/yr",
  CA: "C$39/yr",
  AU: "A$49/yr",
  US: "$29/yr",
};

export const ExitIntentModal = ({ isLoggedIn, isPremium, isPremiumInactive, country }: ExitIntentModalProps) => {
  const [showModal, setShowModal] = useState(false);
  const [readyToShow, setReadyToShow] = useState(false);
  const navigate = useNavigate();

  const lifetimePrice = LIFETIME_PRICES[country || 'US'] || LIFETIME_PRICES.US;
  const yearlyPrice = YEARLY_PRICES[country || 'US'] || YEARLY_PRICES.US;

  // Minimum 30s on page before modal can fire
  useEffect(() => {
    const timer = setTimeout(() => setReadyToShow(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Don't show for premium users (unless isPremiumInactive variant)
    if (isPremium && !isPremiumInactive) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && readyToShow && !hasShownRecently()) {
        setShowModal(true);
        markShown();
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [isPremium, isPremiumInactive, readyToShow]);

  const handleUpgrade = () => {
    setShowModal(false);
    navigate("/pricing");
  };

  const benefits = [
    { smart: `Pay ${lifetimePrice} once ✅`, expensive: `Pay ${yearlyPrice} ❌` },
    { smart: "Unlimited cake designs", expensive: "5 free only" },
    { smart: "Party Pack + AI Planner", expensive: "Not included" },
  ];

  // Engagement modal for premium users who haven't created a cake yet
  if (isPremium && isPremiumInactive) {
    return (
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                🎂 Your first cake is waiting!
              </DialogTitle>
              <DialogDescription className="text-center text-base pt-2">
                You're a Premium member — you haven't designed your first cake yet. It takes 30 seconds.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-party-pink/10 rounded-xl border border-party-pink/20 text-center">
                <p className="font-semibold text-foreground mb-1">What you're missing as a Premium member:</p>
                <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                  <li>✨ Unlimited AI cake designs</li>
                  <li>🎁 Party Pack Generator (invites, banners, cards)</li>
                  <li>🎊 AI Party Planner with RSVP tracking</li>
                  <li>📸 Photo cake maker</li>
                </ul>
              </div>
              <Button onClick={() => { setShowModal(false); navigate('/free-ai-cake-designer'); }} className="w-full py-5 bg-gradient-party text-white font-bold">
                <Sparkles className="w-4 h-4 mr-2" />
                Design My First Cake Now →
              </Button>
              <Button onClick={() => setShowModal(false)} variant="ghost" className="w-full text-muted-foreground">
                I'll explore on my own
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

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
              Before you go — unlock unlimited cakes 🎂
            </DialogTitle>
            <DialogDescription className="text-center text-lg pt-2">
              Your first 5 designs are free. Premium unlocks unlimited cakes, Party Pack Generator and AI Party Planner.
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
                  <p className="font-bold text-destructive mb-2 text-center">Option B (Limited) ❌</p>
                  {benefits.map((b, i) => (
                    <p key={i} className="text-sm mb-1 text-muted-foreground">{b.expensive}</p>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Value Highlight */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-4 bg-gold/10 rounded-lg border border-gold/30 text-center">
                <p className="font-bold text-gold text-lg">💰 Save big with the lifetime deal</p>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4"
            >
              <p className="text-center font-semibold mb-2">Pick the plan that fits your celebrations.</p>
              <p className="text-center text-sm text-muted-foreground">
                Monthly, Yearly or Lifetime — in your local currency.
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
                Get Lifetime Access — {lifetimePrice}
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
              >
                No thanks, I'll stick with 5 free designs
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
