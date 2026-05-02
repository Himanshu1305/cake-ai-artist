import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { safeGetItem, safeSetItem } from '@/utils/storage';

interface UrgencyBannerProps {
  onVisibilityChange?: (visible: boolean) => void;
  onHeightChange?: (height: number) => void;
  countryCode?: string;
}

export const UrgencyBanner = ({ onVisibilityChange, onHeightChange }: UrgencyBannerProps) => {
  const navigate = useNavigate();
  const bannerRef = useRef<HTMLDivElement>(null);

  const [isDismissed, setIsDismissed] = useState(() => {
    const dismissed = safeGetItem('urgency_banner_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      return Date.now() - dismissedTime < 24 * 60 * 60 * 1000;
    }
    return false;
  });

  useEffect(() => {
    onVisibilityChange?.(!isDismissed);
  }, [isDismissed, onVisibilityChange]);

  useEffect(() => {
    if (!bannerRef.current || !onHeightChange) return;
    const update = () => {
      if (bannerRef.current) onHeightChange(bannerRef.current.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(bannerRef.current);
    return () => ro.disconnect();
  }, [onHeightChange, isDismissed]);

  useEffect(() => {
    if (isDismissed) onHeightChange?.(0);
  }, [isDismissed, onHeightChange]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    safeSetItem('urgency_banner_dismissed', Date.now().toString());
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  const handleClick = () => navigate('/pricing');

  return (
    <AnimatePresence>
      <motion.div
        ref={bannerRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-surface via-gold/10 to-surface border-b border-gold/30 backdrop-blur-sm cursor-pointer"
        onClick={handleClick}
      >
        <div className="container mx-auto px-4 py-2 relative">
          <div className="flex items-center justify-center gap-2 pr-8 text-foreground">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-gold" />
            <p className="text-xs md:text-sm font-medium tracking-wide">
              <span className="hidden sm:inline">Join </span>
              <span className="font-bold text-gold">hundreds of</span>
              <span className="hidden sm:inline"> creators designing AI cakes</span>
              <span className="sm:hidden"> creators</span>
              <span className="mx-2 text-muted-foreground">·</span>
              <span className="text-muted-foreground">Start free, no signup needed</span>
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-foreground/10 rounded-full transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
