
CREATE TABLE public.cake_generation_events (
  id BIGSERIAL PRIMARY KEY,
  request_id UUID NOT NULL,
  user_id UUID,
  stage TEXT NOT NULL,
  elapsed_ms INTEGER,
  error_message TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX cake_generation_events_request_id_idx ON public.cake_generation_events (request_id);
CREATE INDEX cake_generation_events_created_at_idx ON public.cake_generation_events (created_at DESC);

GRANT SELECT ON public.cake_generation_events TO authenticated;
GRANT ALL ON public.cake_generation_events TO service_role;

ALTER TABLE public.cake_generation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generation events"
  ON public.cake_generation_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all generation events"
  ON public.cake_generation_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
