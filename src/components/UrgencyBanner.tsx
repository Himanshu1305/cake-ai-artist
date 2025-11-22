import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { SpotsRemainingCounter } from './SpotsRemainingCounter';
import { Button } from './ui/button';

const BANNER_DISMISSED_KEY = 'urgency_banner_dismissed';

export const UrgencyBanner = () => {
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
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
      sessionStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    }
  }, [isDismissed]);

  if (isDismissed || !isSaleActive) {
    return null;
  }

  const handleBannerClick = () => {
    navigate('/pricing');
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-party border-b-2 border-party-pink cursor-pointer"
        onClick={handleBannerClick}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Zap className="w-5 h-5 flex-shrink-0 animate-pulse" />
              <div className="flex items-center gap-2 flex-wrap text-sm md:text-base font-semibold">
                <SpotsRemainingCounter className="flex-shrink-0" />
                <span className="hidden sm:inline">lifetime spots left at $49</span>
                <span className="sm:hidden">at $49</span>
                <span className="hidden md:inline">|</span>
                <span className="hidden md:inline">Sale ends in</span>
                <CountdownTimer compact className="flex-shrink-0" />
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
