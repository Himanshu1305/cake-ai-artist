import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Crown, Star } from 'lucide-react';

const MAX_NOTIFICATIONS = 10;
const SIMULATED_NOTIFICATION_INTERVAL = 180000; // 3 minutes

export const LivePurchaseNotifications = () => {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Subscribe to real-time inserts
    const channel = supabase
      .channel('founding-members-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'founding_members',
        },
        (payload) => {
          if (notificationCount < MAX_NOTIFICATIONS) {
            showPurchaseNotification(payload.new);
            setNotificationCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    // Fallback: Show simulated activity if no real purchases
    const simulatedInterval = setInterval(() => {
      if (notificationCount < MAX_NOTIFICATIONS) {
        showSimulatedNotification();
        setNotificationCount(prev => prev + 1);
      }
    }, SIMULATED_NOTIFICATION_INTERVAL);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(simulatedInterval);
    };
  }, [notificationCount]);

  return null; // This component doesn't render anything
};

function showPurchaseNotification(member: any) {
  const isTier1 = member.tier === 'tier_1_49';
  
  toast.success(
    `${isTier1 ? '👑' : '⭐'} Someone just claimed Lifetime Deal #${member.member_number}!`,
    {
      duration: 5000,
      className: 'bg-gradient-party text-white border-party-pink',
    }
  );
}

function showSimulatedNotification() {
  const randomNumber = Math.floor(Math.random() * 200) + 1;
  const isTier1 = Math.random() > 0.5;
  
  toast.success(
    `${isTier1 ? '👑' : '⭐'} Someone just claimed their Lifetime Deal!`,
    {
      duration: 5000,
      className: 'bg-gradient-party text-white border-party-pink',
    }
  );
}
