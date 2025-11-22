import { useFoundingSpots } from '@/hooks/useFoundingSpots';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Zap } from 'lucide-react';

interface SpotsRemainingCounterProps {
  tier?: 'tier_1_49' | 'tier_2_99' | 'total';
  className?: string;
}

export const SpotsRemainingCounter = ({ tier = 'total', className = '' }: SpotsRemainingCounterProps) => {
  const spots = useFoundingSpots();

  const getSpotsForTier = () => {
    switch (tier) {
      case 'tier_1_49':
        return spots.tier1Available;
      case 'tier_2_99':
        return spots.tier2Available;
      default:
        return spots.totalAvailable;
    }
  };

  const spotsLeft = getSpotsForTier();

  const getUrgencyStyle = () => {
    if (spotsLeft === 0) return { bg: 'bg-muted', text: 'text-muted-foreground', icon: AlertCircle };
    if (spotsLeft < 10) return { bg: 'bg-destructive', text: 'text-destructive-foreground', icon: Zap };
    if (spotsLeft <= 20) return { bg: 'bg-secondary', text: 'text-secondary-foreground', icon: Zap };
    return { bg: 'bg-party-mint', text: 'text-foreground', icon: CheckCircle };
  };

  const { bg, text, icon: Icon } = getUrgencyStyle();

  if (spots.loading) {
    return (
      <Badge variant="outline" className={className}>
        Loading...
      </Badge>
    );
  }

  if (spots.error) {
    return (
      <Badge variant="outline" className={className}>
        {spotsLeft} spots left
      </Badge>
    );
  }

  if (spotsLeft === 0) {
    return (
      <Badge variant="secondary" className={`${className} font-bold`}>
        <AlertCircle className="w-3 h-3 mr-1" />
        SOLD OUT
      </Badge>
    );
  }

  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={spotsLeft < 10 ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 1, repeat: spotsLeft < 10 ? Infinity : 0 }}
      className={className}
    >
      <Badge className={`${bg} ${text} font-semibold`}>
        <Icon className="w-3 h-3 mr-1" />
        {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
      </Badge>
    </motion.div>
  );
};
