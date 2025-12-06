-- Create page visits tracking table
CREATE TABLE public.page_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  country_code TEXT,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID,
  session_id TEXT,
  referrer TEXT,
  user_agent TEXT
);

-- Create index for faster queries
CREATE INDEX idx_page_visits_page_path ON public.page_visits(page_path);
CREATE INDEX idx_page_visits_visited_at ON public.page_visits(visited_at);
CREATE INDEX idx_page_visits_country_code ON public.page_visits(country_code);

-- Enable RLS
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for tracking (public access for recording visits)
CREATE POLICY "Anyone can record page visits"
ON public.page_visits
FOR INSERT
WITH CHECK (true);

-- Only admins can view page visits
CREATE POLICY "Admins can view all page visits"
ON public.page_visits
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));