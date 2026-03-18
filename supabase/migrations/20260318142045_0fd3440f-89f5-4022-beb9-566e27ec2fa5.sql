
-- Allow conversation participants to update conversation updated_at
CREATE POLICY "Participants can update conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (is_conversation_participant(id))
WITH CHECK (is_conversation_participant(id));
