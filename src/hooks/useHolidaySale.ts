import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HolidaySale {
  id: string;
  holidayName: string;
  emoji: string;
  saleLabel: string;
  bannerText: string;
  endDate: Date | null;
  startDate: Date;
  countryCode: string | null;
  isDefault: boolean; // True when this is a default/fallback sale (no countdown)
}

interface UseHolidaySaleOptions {
  countryCode?: string | null;
}

// Fallback sale data when no active sale is found in database
const FALLBACK_SALE: HolidaySale = {
  id: 'fallback',
  holidayName: 'Exclusive Lifetime Deal',
  emoji: '✨',
  saleLabel: 'EXCLUSIVE DEAL!',
  bannerText: '✨ EXCLUSIVE OFFER - LIFETIME ACCESS AT $49 - LIMITED SPOTS REMAINING',
  endDate: null, // No end date for default mode - no countdown
  startDate: new Date('2026-01-01T00:00:00'),
  countryCode: null,
  isDefault: true,
};

// Check if a sale is a "default" type (ends in 2099 = permanent fallback)
const isDefaultSale = (endDate: string): boolean => {
  const year = new Date(endDate).getFullYear();
  return year >= 2099;
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
          const isDefault = isDefaultSale(saleData.end_date);
          setSale({
            id: saleData.id,
            holidayName: saleData.holiday_name,
            emoji: saleData.holiday_emoji,
            saleLabel: saleData.sale_label,
            bannerText: saleData.banner_text,
            endDate: isDefault ? null : new Date(saleData.end_date),
            startDate: new Date(saleData.start_date),
            countryCode: saleData.country_code,
            isDefault,
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
          const isDefault = isDefaultSale(saleData.end_date);
          setSale({
            id: saleData.id,
            holidayName: saleData.holiday_name,
            emoji: saleData.holiday_emoji,
            saleLabel: saleData.sale_label,
            bannerText: saleData.banner_text,
            endDate: isDefault ? null : new Date(saleData.end_date),
            startDate: new Date(saleData.start_date),
            countryCode: saleData.country_code,
            isDefault,
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
