-- Allow admins to insert founding members (for admin grants)
CREATE POLICY "Admins can insert founding members"
ON public.founding_members
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update founding members
CREATE POLICY "Admins can update founding members"
ON public.founding_members
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));