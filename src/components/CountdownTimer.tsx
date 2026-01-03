import { useCountdown } from '@/hooks/useCountdown';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  compact?: boolean;
  className?: string;
}

// January 10, 2026 at 11:59:59 PM
const SALE_END_DATE = new Date('2026-01-10T23:59:59');

export const CountdownTimer = ({ compact = false, className = '' }: CountdownTimerProps) => {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(SALE_END_DATE);

  // Auto-cleanup enabled: Shows "Sale Ended" after Dec 31, 2025
  // Check AdminSaleReminder component for options to extend or close
  if (isExpired) {
    return (
      <div className={`text-destructive font-bold ${className}`}>
        Sale Ended
      </div>
    );
  }

  const getUrgencyColor = () => {
    if (days === 0) return 'text-destructive'; // Red when <24 hours
    if (days <= 7) return 'text-secondary'; // Orange when 1-7 days
    return 'text-party-purple'; // Purple when >7 days
  };

  const timeUnits = [
    { value: days, label: 'd' },
    { value: hours, label: 'h' },
    { value: minutes, label: 'm' },
    { value: seconds, label: 's' },
  ];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 font-mono font-bold ${getUrgencyColor()} ${className}`}>
        <Clock className="w-4 h-4" />
        <span>
          {days > 0 && `${days}d `}
          {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {timeUnits.map(({ value, label }, index) => (
        <motion.div
          key={label}
          initial={{ scale: 1 }}
          animate={days === 0 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: days === 0 ? Infinity : 0 }}
          className="flex flex-col items-center"
        >
          <div className={`bg-surface-elevated border-2 ${days === 0 ? 'border-destructive' : 'border-border'} rounded-lg px-3 py-2 min-w-[60px] text-center`}>
            <span className={`text-2xl md:text-3xl font-bold font-mono ${getUrgencyColor()}`}>
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs text-muted-foreground mt-1 uppercase">{label}</span>
        </motion.div>
      ))}
    </div>
  );
};
