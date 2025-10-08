import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      <DialogContent className="sm:max-w-md bg-gradient-celebration/20 border-party-purple/30 border-2 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Wait! Don't Miss Out! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Unlock unlimited magical cakes with Premium!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-gradient-party/10 rounded-lg p-4 border border-party-pink/30">
            <div className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-party-pink flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              🎊 Limited Time: Get 20% OFF Your First Month!
            </p>
          </div>

          <div className="space-y-2">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
