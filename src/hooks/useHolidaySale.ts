import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HolidaySale {
  id: string;
  holidayName: string;
  emoji: string;
  saleLabel: string;
  bannerText: string;
  endDate: Date;
  startDate: Date;
  countryCode: string | null;
}

interface UseHolidaySaleOptions {
  countryCode?: string | null;
}

// Fallback sale data when no active sale is found
const FALLBACK_SALE: HolidaySale = {
  id: 'fallback',
  holidayName: 'Limited Time Offer',
  emoji: '🎉',
  saleLabel: 'LIMITED TIME!',
  bannerText: '🎉 LIMITED TIME OFFER - LIFETIME DEAL AT $49 - GET IT NOW',
  endDate: new Date('2026-12-31T23:59:59'),
  startDate: new Date('2026-01-01T00:00:00'),
  countryCode: null,
};

export const useHolidaySale = ({ countryCode }: UseHolidaySaleOptions = {}) => {
  const [sale, setSale] = useState<HolidaySale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActiveSale = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First try to get country-specific active sale
        let query = supabase
          .from('holiday_sales')
          .select('*')
          .eq('is_active', true)
          .lte('start_date', new Date().toISOString())
          .gte('end_date', new Date().toISOString())
          .order('priority', { ascending: false })
          .limit(1);

        if (countryCode) {
          query = query.eq('country_code', countryCode);
        }

        const { data: countryData, error: countryError } = await query;

        if (countryError) {
          console.error('Error fetching country-specific sale:', countryError);
        }

        // If we found a country-specific sale, use it
        if (countryData && countryData.length > 0) {
          const saleData = countryData[0];
          setSale({
            id: saleData.id,
            holidayName: saleData.holiday_name,
            emoji: saleData.holiday_emoji,
            saleLabel: saleData.sale_label,
            bannerText: saleData.banner_text,
            endDate: new Date(saleData.end_date),
            startDate: new Date(saleData.start_date),
            countryCode: saleData.country_code,
          });
          setIsLoading(false);
          return;
        }

        // Fall back to global sale (country_code is null)
        const { data: globalData, error: globalError } = await supabase
          .from('holiday_sales')
          .select('*')
          .is('country_code', null)
          .eq('is_active', true)
          .lte('start_date', new Date().toISOString())
          .gte('end_date', new Date().toISOString())
          .order('priority', { ascending: false })
          .limit(1);

        if (globalError) {
          console.error('Error fetching global sale:', globalError);
        }

        if (globalData && globalData.length > 0) {
          const saleData = globalData[0];
          setSale({
            id: saleData.id,
            holidayName: saleData.holiday_name,
            emoji: saleData.holiday_emoji,
            saleLabel: saleData.sale_label,
            bannerText: saleData.banner_text,
            endDate: new Date(saleData.end_date),
            startDate: new Date(saleData.start_date),
            countryCode: saleData.country_code,
          });
        } else {
          // No active sale found, use fallback
          setSale(FALLBACK_SALE);
        }
      } catch (err) {
        console.error('Error in useHolidaySale:', err);
        setError(err as Error);
        // Use fallback on error
        setSale(FALLBACK_SALE);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveSale();
  }, [countryCode]);

  return { sale, isLoading, error };
};
