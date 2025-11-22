import { Crown, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FoundingMemberBadgeProps {
  memberNumber: number;
  tier: 'tier_1_49' | 'tier_2_99';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const FoundingMemberBadge = ({
  memberNumber,
  tier,
  size = 'medium',
  className = '',
}: FoundingMemberBadgeProps) => {
  const isTier1 = tier === 'tier_1_49';
  
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5',
  };

  const Icon = isTier1 ? Crown : Star;
  const bgGradient = isTier1 ? 'bg-gradient-gold' : 'bg-gradient-to-r from-slate-400 to-slate-500';
  const label = isTier1 ? 'Founding Member' : 'Launch Supporter';

  return (
    <Badge
      className={cn(
        bgGradient,
        'text-white font-bold shimmer',
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn(iconSizes[size], 'mr-1')} />
      {label} #{memberNumber}
    </Badge>
  );
};
