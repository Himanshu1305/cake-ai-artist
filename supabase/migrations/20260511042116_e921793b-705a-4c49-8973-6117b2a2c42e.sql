-- Allow admins to read activity-related tables for the per-user activity panel
CREATE POLICY "Admins can view all parties"
  ON public.parties FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all party packs"
  ON public.party_packs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all generation tracking"
  ON public.generation_tracking FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));