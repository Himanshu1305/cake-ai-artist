import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PreviewSaleData {
  saleLabel: string;
  bannerText: string;
  emoji: string;
  endDate: Date | null;
  isDefault: boolean;
}

interface PreviewUrgencyBannerProps {
  sale: PreviewSaleData;
}

export const PreviewUrgencyBanner = ({ sale }: PreviewUrgencyBannerProps) => {
  const isDefaultMode = sale.isDefault;

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className={`w-full py-2 px-4 ${
        isDefaultMode 
          ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500' 
          : 'bg-gradient-to-r from-party-pink via-party-purple to-party-blue'
      } text-white text-center relative overflow-hidden border-b border-white/10`}
    >
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                {isDefaultMode ? (
                  <Sparkles className="w-4 h-4 animate-pulse" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <Badge 
                  variant="secondary" 
                  className={`${
                    isDefaultMode 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/25 text-white'
                  } font-bold text-xs animate-pulse`}
                >
                  {sale.emoji} {sale.saleLabel}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isDefaultMode ? 'Exclusive limited-time offer' : 'Limited time holiday offer'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <span className="text-sm font-medium">
          {sale.bannerText}
        </span>
        
        {isDefaultMode ? (
          <Badge className="bg-destructive text-destructive-foreground font-semibold">
            <Zap className="w-3 h-3 mr-1" />
            Limited spots remaining
          </Badge>
        ) : sale.endDate && (
          <Badge className="bg-white/20 text-white font-mono">
            {formatTimeRemaining(sale.endDate)}
          </Badge>
        )}
      </div>
    </motion.div>
  );
};
