import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MAX_NOTIFICATIONS = 5;
const BASE_INTERVAL = 420000; // 7 minutes base
const VARIANCE = 120000; // ±2 minutes randomization
const INITIAL_DELAY = 180000; // 3 minutes before first notification

const getRandomInterval = () => BASE_INTERVAL + (Math.random() * VARIANCE * 2 - VARIANCE);

const notificationMessages = [
  '👑 Someone just claimed their Lifetime Deal!',
  '⭐ A new member joined the celebration!',
  '🎉 Another cake lover grabbed the deal!',
  '✨ Someone unlocked lifetime access!',
  '🎂 A new creator joined the party!',
];

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
  const message = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
  
  toast.success(message, {
    duration: 5000,
    className: 'bg-gradient-party text-white border-party-pink',
  });
}

export const LivePurchaseNotifications = () => {
  const notificationCountRef = useRef(0);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
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
          if (isMountedRef.current && notificationCountRef.current < MAX_NOTIFICATIONS) {
            showPurchaseNotification(payload.new);
            notificationCountRef.current++;
          }
        }
      )
      .subscribe();

    // Schedule simulated notifications with random intervals
    const scheduleNextNotification = () => {
      if (!isMountedRef.current || notificationCountRef.current >= MAX_NOTIFICATIONS) return;
      
      const timeout = setTimeout(() => {
        if (isMountedRef.current && notificationCountRef.current < MAX_NOTIFICATIONS) {
          showSimulatedNotification();
          notificationCountRef.current++;
          timeoutsRef.current.delete(timeout);
          scheduleNextNotification();
        }
      }, getRandomInterval());
      
      timeoutsRef.current.add(timeout);
    };

    // Start after initial delay
    const initialTimeout = setTimeout(() => {
      if (isMountedRef.current && notificationCountRef.current < MAX_NOTIFICATIONS) {
        showSimulatedNotification();
        notificationCountRef.current++;
        scheduleNextNotification();
      }
    }, INITIAL_DELAY);
    
    timeoutsRef.current.add(initialTimeout);

    return () => {
      isMountedRef.current = false;
      supabase.removeChannel(channel);
      // Clear all pending timeouts on unmount
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []); // Empty dependency array - runs once on mount

  return null;
};
