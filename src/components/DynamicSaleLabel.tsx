import { useHolidaySale } from '@/hooks/useHolidaySale';
import { Skeleton } from '@/components/ui/skeleton';

interface DynamicSaleLabelProps {
  countryCode?: string;
  className?: string;
  suffix?: string;
}

export const DynamicSaleLabel = ({ countryCode, className = '', suffix = 'ENDS IN:' }: DynamicSaleLabelProps) => {
  const { sale, isLoading } = useHolidaySale({ countryCode });

  if (isLoading) {
    return <Skeleton className="h-6 w-48 bg-white/20" />;
  }

  if (!sale) {
    return (
      <span className={className}>
        🎉 LIMITED TIME OFFER {suffix}
      </span>
    );
  }

  return (
    <span className={className}>
      <span className="inline-block animate-bounce">{sale.emoji}</span> {sale.saleLabel.replace('!', '')} {suffix}
    </span>
  );
};
