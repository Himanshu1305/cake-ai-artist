import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBlogViewTracking = (postId: string | undefined) => {
  useEffect(() => {
    if (!postId) return;

    const trackView = async () => {
      try {
        // Get or create session ID
        let sessionId = sessionStorage.getItem('blog_session_id');
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          sessionStorage.setItem('blog_session_id', sessionId);
        }

        // Prevent duplicate views within same session for same post
        const viewedPosts = JSON.parse(sessionStorage.getItem('viewed_blog_posts') || '[]');
        if (viewedPosts.includes(postId)) return;

        await supabase.from('blog_post_views').insert({
          post_id: postId,
          session_id: sessionId,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        });

        viewedPosts.push(postId);
        sessionStorage.setItem('viewed_blog_posts', JSON.stringify(viewedPosts));
      } catch (error) {
        // Silently fail - tracking shouldn't break the page
        console.error('Blog view tracking error:', error);
      }
    };

    trackView();
  }, [postId]);
};
