CREATE TABLE public.engagement_email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_type text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, email_type)
);

ALTER TABLE public.engagement_email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all engagement logs"
ON public.engagement_email_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage engagement logs"
ON public.engagement_email_logs FOR ALL
TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Users can view their own engagement logs"
ON public.engagement_email_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE INDEX idx_engagement_email_logs_user_id ON public.engagement_email_logs(user_id);
CREATE INDEX idx_engagement_email_logs_email_type ON public.engagement_email_logs(email_type);