import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MAX_NOTIFICATIONS = 5;
const BASE_INTERVAL = 420000; // 7 minutes base
const VARIANCE = 120000; // ±2 minutes randomization
const INITIAL_DELAY = 180000; // 3 minutes before first notification

// Get random interval between 5-9 minutes
const getRandomInterval = () => BASE_INTERVAL + (Math.random() * VARIANCE * 2 - VARIANCE);

export const LivePurchaseNotifications = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Schedule simulated notifications with random intervals
    const scheduleNextNotification = () => {
      if (notificationCount >= MAX_NOTIFICATIONS) return;
      
      timeoutRef.current = setTimeout(() => {
        showSimulatedNotification();
        setNotificationCount(prev => prev + 1);
        scheduleNextNotification();
      }, getRandomInterval());
    };

    // Start after initial delay
    const initialTimeout = setTimeout(() => {
      if (notificationCount < MAX_NOTIFICATIONS) {
        showSimulatedNotification();
        setNotificationCount(prev => prev + 1);
        scheduleNextNotification();
      }
    }, INITIAL_DELAY);

    return () => {
      supabase.removeChannel(channel);
      clearTimeout(initialTimeout);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [notificationCount]);

  return null;
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

const notificationMessages = [
  '👑 Someone just claimed their Lifetime Deal!',
  '⭐ A new member joined the celebration!',
  '🎉 Another cake lover grabbed the deal!',
  '✨ Someone unlocked lifetime access!',
  '🎂 A new creator joined the party!',
];

function showSimulatedNotification() {
  const message = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
  
  toast.success(message, {
    duration: 5000,
    className: 'bg-gradient-party text-white border-party-pink',
  });
}
