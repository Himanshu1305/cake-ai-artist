-- Add user convenience policies for feedback table
CREATE POLICY "Users can update their own feedback"
ON public.feedback
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
ON public.feedback
FOR DELETE
USING (auth.uid() = user_id);

-- Add user convenience policy for party_packs table
CREATE POLICY "Users can update their own party packs"
ON public.party_packs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);