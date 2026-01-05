-- Create blog_post_views table for tracking
CREATE TABLE public.blog_post_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT
);

-- Create indexes for performance
CREATE INDEX idx_blog_post_views_post_id ON blog_post_views(post_id);
CREATE INDEX idx_blog_post_views_viewed_at ON blog_post_views(viewed_at);

-- Enable RLS
ALTER TABLE blog_post_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert views (anonymous users can view posts)
CREATE POLICY "Anyone can insert blog views" ON blog_post_views
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to view aggregate stats (for displaying view counts)
CREATE POLICY "Anyone can view blog stats" ON blog_post_views
  FOR SELECT
  USING (true);

-- Add digest columns to blog_subscribers
ALTER TABLE blog_subscribers 
ADD COLUMN IF NOT EXISTS last_digest_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS digest_frequency TEXT DEFAULT 'weekly';