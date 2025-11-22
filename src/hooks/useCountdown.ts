import { useState, useEffect } from 'react';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const useCountdown = (targetDate: Date): CountdownTime => {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    // Console warning for January 1st decision
    const now = new Date();
    const janFirst2026 = new Date('2026-01-01T00:00:00');
    const hasShownWarning = sessionStorage.getItem('jan1_sale_warning_shown');
    
    if (now >= janFirst2026 && !hasShownWarning) {
      console.warn(
        '%c⚠️ FOUNDING MEMBER SALE DECISION NEEDED ⚠️',
        'color: #ff6b6b; font-size: 16px; font-weight: bold;',
        '\n\nThe sale ended on Dec 31, 2025.',
        '\n\nOptions:',
        '\n1. Extend Sale: Update date in UrgencyBanner.tsx and CountdownTimer.tsx',
        '\n2. Close Sale: Follow steps in FOUNDING_MEMBER_CLEANUP_INSTRUCTIONS.md',
        '\n\nCheck AdminSaleReminder component at top of homepage for quick actions.'
      );
      sessionStorage.setItem('jan1_sale_warning_shown', 'true');
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

function calculateTimeLeft(targetDate: Date): CountdownTime {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: false };
}
