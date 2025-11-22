import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FoundingMember {
  id: string;
  member_number: number;
  tier: string;
  special_badge: string | null;
  display_on_wall: boolean;
  purchased_at: string;
}

interface UseFoundingMembersResult {
  members: FoundingMember[];
  loading: boolean;
  error: string | null;
  loadMore: () => void;
  hasMore: boolean;
}

const PAGE_SIZE = 30;

export const useFoundingMembers = (filter?: 'tier_1_49' | 'tier_2_99' | 'all') => {
  const [members, setMembers] = useState<FoundingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchMembers = async (pageNum: number, append = false) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('founding_members')
        .select('*')
        .eq('display_on_wall', true)
        .order('member_number', { ascending: true })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (filter && filter !== 'all') {
        query = query.eq('tier', filter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (data) {
        setMembers(prev => append ? [...prev, ...data] : data);
        setHasMore(data.length === PAGE_SIZE);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching founding members:', err);
      setError('Failed to load founding members');
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setMembers([]);
    fetchMembers(0, false);
  }, [filter]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMembers(nextPage, true);
    }
  };

  return { members, loading, error, loadMore, hasMore };
};
