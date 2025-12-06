-- Create blog_subscribers table
CREATE TABLE public.blog_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;

-- Admins can view all subscribers
CREATE POLICY "Admins can view all blog subscribers"
ON public.blog_subscribers
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to blog"
ON public.blog_subscribers
FOR INSERT
WITH CHECK (true);

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.blog_subscribers
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own subscription
CREATE POLICY "Users can update their own subscription"
ON public.blog_subscribers
FOR UPDATE
USING (auth.uid() = user_id);