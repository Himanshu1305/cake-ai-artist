
-- Cake generation job tracking for High Quality (background view streaming)
CREATE TABLE public.cake_generation_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  cake_style text NOT NULL,
  hero_view text,
  hero_url text,
  side_url text,
  top_url text,
  greeting_message text,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

CREATE INDEX idx_cake_generation_jobs_user ON public.cake_generation_jobs(user_id, created_at DESC);

ALTER TABLE public.cake_generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generation jobs"
  ON public.cake_generation_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Inserts/updates are performed by the edge function via service role; no client write policies needed.

CREATE TRIGGER set_cake_generation_jobs_updated_at
  BEFORE UPDATE ON public.cake_generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime so the client can subscribe to row updates as background views finish.
ALTER TABLE public.cake_generation_jobs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cake_generation_jobs;
