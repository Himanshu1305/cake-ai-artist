import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { SpotsRemainingCounter } from './SpotsRemainingCounter';
import { Button } from './ui/button';

const BANNER_DISMISSED_KEY = 'urgency_banner_dismissed';
const DISMISS_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

interface UrgencyBannerProps {
  onVisibilityChange?: (visible: boolean) => void;
}

export const UrgencyBanner = ({ onVisibilityChange }: UrgencyBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(() => {
    const dismissedAt = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (dismissedAt) {
      const timeSinceDismissed = Date.now() - parseInt(dismissedAt, 10);
      // Show again after 1 hour
      return timeSinceDismissed < DISMISS_DURATION;
    }
    return false;
  });
  const navigate = useNavigate();

  // Check if sale is still active
  const saleEndDate = new Date('2025-12-31T23:59:59');
  // Auto-cleanup enabled: Banner will hide after Dec 31, 2025
  // If sale ends and you want to extend, update the date above
  // To close permanently, follow FOUNDING_MEMBER_CLEANUP_INSTRUCTIONS.md
  const isSaleActive = new Date() < saleEndDate;

  useEffect(() => {
    if (isDismissed) {
      localStorage.setItem(BANNER_DISMISSED_KEY, Date.now().toString());
    }
  }, [isDismissed]);

  useEffect(() => {
    onVisibilityChange?.(!(isDismissed || !isSaleActive));
  }, [isDismissed, isSaleActive, onVisibilityChange]);

  if (isDismissed || !isSaleActive) {
    return null;
  }

  const handleBannerClick = () => {
    navigate('/pricing');
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem(BANNER_DISMISSED_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-party border-b-2 border-party-pink cursor-pointer"
        onClick={handleBannerClick}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Zap className="w-5 h-5 flex-shrink-0 animate-pulse" />
              <div className="flex items-center gap-2 flex-wrap text-sm md:text-base font-semibold">
                <span>🎉 NEW YEAR LIFETIME DEAL -</span>
                <SpotsRemainingCounter className="flex-shrink-0" />
                <span className="hidden sm:inline">SPOTS LEFT AT $49 - ENDS DEC 31</span>
                <span className="sm:hidden">LEFT - ENDS DEC 31</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="flex-shrink-0 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
