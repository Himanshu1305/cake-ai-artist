CREATE TABLE public.cake_generation_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  client_attempt_id TEXT NOT NULL,
  quality TEXT,
  has_photo BOOLEAN,
  photo_bytes INTEGER,
  client_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_finished_at TIMESTAMPTZ,
  outcome TEXT NOT NULL DEFAULT 'started',
  job_id UUID,
  error_message TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.cake_generation_attempts TO authenticated;
GRANT ALL ON public.cake_generation_attempts TO service_role;
ALTER TABLE public.cake_generation_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own attempts" ON public.cake_generation_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access attempts" ON public.cake_generation_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX cake_generation_attempts_user_idx ON public.cake_generation_attempts (user_id, client_started_at DESC);
CREATE INDEX cake_generation_attempts_outcome_idx ON public.cake_generation_attempts (outcome, client_started_at DESC);