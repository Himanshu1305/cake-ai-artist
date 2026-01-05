-- Create blog_posts table for AI-generated articles
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  category TEXT NOT NULL,
  target_country TEXT, -- 'IN', 'UK', 'AU', 'CA', or NULL for universal
  read_time TEXT DEFAULT '5 min read',
  meta_description TEXT,
  keywords TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  author_name TEXT DEFAULT 'Cake AI Artist Team',
  ai_disclosure TEXT DEFAULT 'This article was written with AI assistance and reviewed by our editorial team.'
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can read published posts" 
ON public.blog_posts 
FOR SELECT 
TO anon, authenticated
USING (is_published = true);

-- Admins can read all posts (including unpublished)
CREATE POLICY "Admins can read all posts" 
ON public.blog_posts 
FOR SELECT 
TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Admins can insert posts
CREATE POLICY "Admins can insert posts" 
ON public.blog_posts 
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Admins can update posts
CREATE POLICY "Admins can update posts" 
ON public.blog_posts 
FOR UPDATE 
TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Admins can delete posts
CREATE POLICY "Admins can delete posts" 
ON public.blog_posts 
FOR DELETE 
TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create index for faster queries
CREATE INDEX idx_blog_posts_published ON public.blog_posts (is_published, published_at DESC);
CREATE INDEX idx_blog_posts_country ON public.blog_posts (target_country);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts (slug);