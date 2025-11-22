import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share2, Download, Sparkles } from "lucide-react";

interface SuccessCelebrationProps {
  show: boolean;
  recipientName: string;
  onClose: () => void;
  onShare: () => void;
  onDownload: () => void;
  onCreateAnother: () => void;
}

export const SuccessCelebration = ({
  show,
  recipientName,
  onClose,
  onShare,
  onDownload,
  onCreateAnother
}: SuccessCelebrationProps) => {
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (show && !hasShown) {
      setHasShown(true);
      
      // Confetti burst
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#ec4899", "#a855f7", "#eab308"],
        });
        
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#ec4899", "#a855f7", "#eab308"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [show, hasShown]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="p-8 max-w-md w-full bg-surface-elevated border-2 border-party-pink">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
                className="text-6xl text-center mb-4"
              >
                🎉
              </motion.div>
              
              <h2 className="text-3xl font-bold text-center mb-2 text-foreground">
                Amazing!
              </h2>
              
              <p className="text-center text-muted-foreground mb-6">
                Your cake for <span className="font-semibold text-party-pink">{recipientName}</span> looks incredible! 
                Ready to make their day?
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={onShare}
                  className="w-full bg-party-purple hover:bg-party-purple/90 gap-2"
                  size="lg"
                >
                  <Share2 className="h-4 w-4" />
                  Share Your Creation
                </Button>
                
                <Button
                  onClick={onDownload}
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                >
                  <Download className="h-4 w-4" />
                  Download Image
                </Button>
                
                <Button
                  onClick={onCreateAnother}
                  variant="ghost"
                  className="w-full gap-2"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4" />
                  Create Another
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
