import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FoundingSpots {
  tier1Available: number;
  tier1Sold: number;
  tier2Available: number;
  tier2Sold: number;
  totalAvailable: number;
  loading: boolean;
  error: string | null;
}

const CACHE_KEY = 'founding_spots_cache';
const CACHE_DURATION = 30000; // 30 seconds

export const useFoundingSpots = () => {
  const [spots, setSpots] = useState<FoundingSpots>(() => {
    // Try to load from cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return { ...data, loading: true, error: null };
      }
    }
    return {
      tier1Available: 50,
      tier1Sold: 0,
      tier2Available: 150,
      tier2Sold: 0,
      totalAvailable: 200,
      loading: true,
      error: null,
    };
  });

  const fetchSpots = async () => {
    try {
      const { data, error } = await supabase.rpc('get_available_spots');
      
      if (error) throw error;

      const result = data as any;
      const spotsData = {
        tier1Available: result.tier_1_available,
        tier1Sold: result.tier_1_sold,
        tier2Available: result.tier_2_available,
        tier2Sold: result.tier_2_sold,
        totalAvailable: result.total_available,
        loading: false,
        error: null,
      };

      setSpots(spotsData);

      // Cache the result
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: spotsData, timestamp: Date.now() })
      );
    } catch (err) {
      console.error('Error fetching founding spots:', err);
      setSpots(prev => ({ ...prev, loading: false, error: 'Failed to load spots' }));
    }
  };

  useEffect(() => {
    fetchSpots();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchSpots, CACHE_DURATION);
    
    return () => clearInterval(interval);
  }, []);

  return spots;
};
