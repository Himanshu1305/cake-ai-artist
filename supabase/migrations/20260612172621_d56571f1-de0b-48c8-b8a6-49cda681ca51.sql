CREATE TABLE public.system_alert_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  details jsonb
);
CREATE INDEX idx_system_alert_log_type_time ON public.system_alert_log (alert_type, sent_at DESC);
GRANT ALL ON public.system_alert_log TO service_role;
ALTER TABLE public.system_alert_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view alert log" ON public.system_alert_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));