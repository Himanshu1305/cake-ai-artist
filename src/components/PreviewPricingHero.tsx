import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Timer } from 'lucide-react';

interface PreviewSaleData {
  saleLabel: string;
  holidayName: string;
  bannerText: string;
  emoji: string;
  endDate: Date | null;
  isDefault: boolean;
}

interface PreviewPricingHeroProps {
  sale: PreviewSaleData;
}

export const PreviewPricingHero = ({ sale }: PreviewPricingHeroProps) => {
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
    <div className="relative overflow-hidden rounded-lg">
      {/* Background */}
      <div className={`absolute inset-0 ${
        isDefaultMode 
          ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500' 
          : 'bg-gradient-to-r from-party-pink via-party-purple to-party-blue'
      } opacity-90`} />
      
      <div className="relative z-10 p-6 text-white text-center">
        {/* Sale Label */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl animate-bounce">{sale.emoji}</span>
          <span className="text-lg font-bold uppercase tracking-wide">
            {isDefaultMode ? 'EXCLUSIVE LIFETIME DEAL' : `${sale.holidayName} - ENDS SOON`}
          </span>
          <span className="text-2xl animate-bounce">{sale.emoji}</span>
        </div>

        {/* Countdown or Spots */}
        <div className="flex justify-center">
          {isDefaultMode ? (
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white text-sm py-1 px-3">
                <Sparkles className="w-4 h-4 mr-2" />
                LIMITED SPOTS REMAINING
              </Badge>
              <Badge className="bg-destructive text-destructive-foreground font-semibold">
                <Zap className="w-3 h-3 mr-1" />
                Act Now!
              </Badge>
            </div>
          ) : sale.endDate ? (
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white text-lg py-2 px-4 font-mono">
                <Timer className="w-4 h-4 mr-2" />
                {formatTimeRemaining(sale.endDate)}
              </Badge>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
