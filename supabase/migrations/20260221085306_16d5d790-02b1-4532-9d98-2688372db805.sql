
-- Create upgrade_nudge_logs table
CREATE TABLE public.upgrade_nudge_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_variant INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.upgrade_nudge_logs ENABLE ROW LEVEL SECURITY;

-- Service role can manage all logs
CREATE POLICY "Service role can manage nudge logs"
  ON public.upgrade_nudge_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Users can view their own logs
CREATE POLICY "Users can view their own nudge logs"
  ON public.upgrade_nudge_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all logs
CREATE POLICY "Admins can view all nudge logs"
  ON public.upgrade_nudge_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for preventing duplicate sends within the same week
CREATE UNIQUE INDEX idx_nudge_logs_user_week ON public.upgrade_nudge_logs (user_id, week_number);

-- Index for querying by week
CREATE INDEX idx_nudge_logs_week ON public.upgrade_nudge_logs (week_number);
