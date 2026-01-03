import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UrgencyBannerProps {
  onVisibilityChange?: (visible: boolean) => void;
}

export const UrgencyBanner = ({ onVisibilityChange }: UrgencyBannerProps) => {
  const navigate = useNavigate();

  // Check if sale is still active
  const saleEndDate = new Date('2026-01-10T23:59:59');
  const isSaleActive = new Date() < saleEndDate;

  useEffect(() => {
    onVisibilityChange?.(isSaleActive);
  }, [isSaleActive, onVisibilityChange]);

  if (!isSaleActive) {
    return null;
  }

  const handleBannerClick = () => {
    navigate('/pricing');
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center gap-4 text-white">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 flex-shrink-0 animate-pulse" />
                    <div className="flex items-center gap-2 flex-wrap text-sm md:text-base font-semibold">
                      <span className="bg-yellow-400 text-party-purple px-2 py-0.5 rounded-full text-xs font-bold animate-pulse shadow-lg">
                        EXTENDED!
                      </span>
                      <span>🎉 NEW YEAR LIFETIME DEAL - LIMITED SPOTS AT $49 - ENDS JAN 10</span>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-gray-800 border shadow-lg">
                <p className="font-medium">Extended by popular demand! Don't miss this limited-time offer.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
