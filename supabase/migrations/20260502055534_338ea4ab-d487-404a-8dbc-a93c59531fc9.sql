-- 1. Remove public access to personal data on generated_images base table
DROP POLICY IF EXISTS "Anyone can view featured images" ON public.generated_images;

-- 2. Lock scheduled_task_runs service policy to service_role only
DROP POLICY IF EXISTS "Service role can manage task runs" ON public.scheduled_task_runs;
CREATE POLICY "Service role can manage task runs"
  ON public.scheduled_task_runs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Lock upgrade_nudge_logs service policy to service_role only
DROP POLICY IF EXISTS "Service role can manage nudge logs" ON public.upgrade_nudge_logs;
CREATE POLICY "Service role can manage nudge logs"
  ON public.upgrade_nudge_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);