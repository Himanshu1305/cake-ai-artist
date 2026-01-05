import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBlogViewCounts = () => {
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchViewCounts = async () => {
      try {
        // Get views from last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
          .from('blog_post_views')
          .select('post_id')
          .gte('viewed_at', thirtyDaysAgo);

        if (error) {
          console.error('Error fetching view counts:', error);
          return;
        }

        // Count views per post
        const counts: Record<string, number> = {};
        data?.forEach(view => {
          counts[view.post_id] = (counts[view.post_id] || 0) + 1;
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
