import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface UrgencyBannerProps {
  onVisibilityChange?: (visible: boolean) => void;
}

export const UrgencyBanner = ({ onVisibilityChange }: UrgencyBannerProps) => {
  const navigate = useNavigate();

  // Check if sale is still active
  const saleEndDate = new Date('2025-12-31T23:59:59');
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
          <div className="flex items-center justify-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 flex-shrink-0 animate-pulse" />
              <div className="flex items-center gap-2 flex-wrap text-sm md:text-base font-semibold">
                <span>🎉 NEW YEAR LIFETIME DEAL - LIMITED SPOTS AT $49 - ENDS DEC 31</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
