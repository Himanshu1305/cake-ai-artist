import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { safeGetItem, safeSetItem } from '@/utils/storage';
import { useHolidaySale } from '@/hooks/useHolidaySale';
import { CountdownTimer } from '@/components/CountdownTimer';
import { SpotsRemainingCounter } from '@/components/SpotsRemainingCounter';

interface UrgencyBannerProps {
  onVisibilityChange?: (visible: boolean) => void;
  onHeightChange?: (height: number) => void;
  countryCode?: string;
}

export const UrgencyBanner = ({ onVisibilityChange, onHeightChange, countryCode }: UrgencyBannerProps) => {
  const navigate = useNavigate();
  const bannerRef = useRef<HTMLDivElement>(null);
  const { sale, isLoading } = useHolidaySale({ countryCode });

  // For default mode (no campaign), always show the banner
  // For campaign mode, check if sale hasn't expired
  const isSaleActive = sale ? (sale.isDefault || (sale.endDate && new Date() < sale.endDate)) : false;

  // Check if user dismissed the banner (persisted for 24 hours)
  const [isDismissed, setIsDismissed] = useState(() => {
    const dismissed = safeGetItem('urgency_banner_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      return Date.now() - dismissedTime < 24 * 60 * 60 * 1000; // 24 hours
    }
    return false;
  });

  useEffect(() => {
    onVisibilityChange?.(isSaleActive && !isDismissed);
  }, [isSaleActive, isDismissed, onVisibilityChange]);

  // Measure and report banner height dynamically
  useEffect(() => {
    if (!bannerRef.current || !onHeightChange) return;
    
    const updateHeight = () => {
      if (bannerRef.current) {
        onHeightChange(bannerRef.current.offsetHeight);
      }
    };
    
    updateHeight();
    
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(bannerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [onHeightChange, isSaleActive, isDismissed, isLoading, sale]);

  // Report 0 height when banner is hidden
  useEffect(() => {
    if (!isSaleActive || isDismissed || isLoading || !sale) {
      onHeightChange?.(0);
    }
  }, [isSaleActive, isDismissed, isLoading, sale, onHeightChange]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to /pricing
    safeSetItem('urgency_banner_dismissed', Date.now().toString());
    setIsDismissed(true);
  };

  if (!isSaleActive || isDismissed || isLoading || !sale) {
    return null;
  }

  const handleBannerClick = () => {
    navigate('/pricing');
  };

  // Different styling for default mode vs campaign mode
  const isDefaultMode = sale.isDefault;
  const bannerBgClass = isDefaultMode 
    ? 'bg-gradient-gold' // Elegant gold for default mode
    : 'bg-gradient-party'; // Party colors for campaigns
  const borderClass = isDefaultMode
    ? 'border-gold'
    : 'border-party-pink';

  return (
    <AnimatePresence>
      <motion.div
        ref={bannerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 ${bannerBgClass} border-b-2 ${borderClass} cursor-pointer`}
        onClick={handleBannerClick}
      >
        <div className="container mx-auto px-4 py-2 relative">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center gap-4 text-white pr-8">
                  <div className="flex items-center gap-2">
                    {isDefaultMode ? (
                      <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse" />
                    ) : (
                      <Zap className="w-5 h-5 flex-shrink-0 animate-pulse" />
                    )}
                    <div className="flex items-center gap-2 flex-wrap text-sm md:text-base font-semibold">
                      <span className={`${isDefaultMode ? 'bg-white text-gold' : 'bg-yellow-400 text-party-purple'} px-2 py-0.5 rounded-full text-xs font-bold animate-pulse shadow-lg`}>
                        {sale.saleLabel}
                      </span>
                      <span>{sale.bannerText}</span>
                      {/* Show countdown for campaigns, spots for default mode */}
                      {!isDefaultMode && sale.endDate && (
                        <CountdownTimer compact endDate={sale.endDate} className="ml-2" />
                      )}
                      {isDefaultMode && (
                        <SpotsRemainingCounter tier="total" className="ml-2" />
                      )}
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-gray-800 border shadow-lg">
                <p className="font-medium">
                  {isDefaultMode 
                    ? "Exclusive lifetime deal - limited spots available!"
                    : `${sale.holidayName} Special! Don't miss this limited-time offer.`
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
