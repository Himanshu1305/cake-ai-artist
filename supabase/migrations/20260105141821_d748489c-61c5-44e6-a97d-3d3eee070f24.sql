-- Create scheduled_task_runs table for tracking cron job executions
CREATE TABLE public.scheduled_task_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  result_message TEXT,
  error_message TEXT,
  records_processed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick lookups by task name and time
CREATE INDEX idx_scheduled_task_runs_task_name ON scheduled_task_runs(task_name, started_at DESC);

-- Enable RLS
ALTER TABLE scheduled_task_runs ENABLE ROW LEVEL SECURITY;

-- Admins can read all task runs
CREATE POLICY "Admins can read scheduled task runs" ON scheduled_task_runs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Service role can manage all (for edge functions)
CREATE POLICY "Service role can manage task runs" ON scheduled_task_runs
  FOR ALL USING (true) WITH CHECK (true);