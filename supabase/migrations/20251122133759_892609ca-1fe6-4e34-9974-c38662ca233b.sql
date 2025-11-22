-- Create feedback table for user feedback and ratings
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_type TEXT NOT NULL, -- 'widget', 'post_generation'
  category TEXT, -- 'bug', 'feature', 'general', 'compliment'
  message TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_feedback_user ON public.feedback(user_id);
CREATE INDEX idx_feedback_created ON public.feedback(created_at DESC);
CREATE INDEX idx_feedback_type ON public.feedback(feedback_type);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own feedback"
ON public.feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add comment for clarity
COMMENT ON TABLE public.feedback IS 'Stores user feedback and ratings from widget and post-generation prompts';