import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBlogViewCounts = () => {
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchViewCounts = async () => {
      try {
        // Use the secure aggregated view that doesn't expose session IDs or user agents
        const { data, error } = await supabase
          .from('public_blog_stats')
          .select('post_id, view_count');

        if (error) {
          console.error('Error fetching view counts:', error);
          return;
        }

        // Build the counts object from the aggregated view
        const counts: Record<string, number> = {};
        data?.forEach(row => {
          counts[row.post_id] = row.view_count;
        });
        
        setViewCounts(counts);
      } catch (error) {
        console.error('Error fetching view counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchViewCounts();
  }, []);

  return { viewCounts, isLoading };
};
