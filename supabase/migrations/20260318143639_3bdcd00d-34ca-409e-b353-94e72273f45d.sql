
-- 1. Create atomic function to get or create a conversation between member and community owner
CREATE OR REPLACE FUNCTION public.get_or_create_admin_conversation(_community_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _profile_id uuid;
  _owner_id uuid;
  _conv_id uuid;
BEGIN
  -- Get current user's profile id
  _profile_id := get_current_profile_id();
  IF _profile_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify user is a member of this community
  IF NOT is_community_member(_community_id) THEN
    RAISE EXCEPTION 'Not a community member';
  END IF;

  -- Get community owner's profile id
  SELECT cm.user_id INTO _owner_id
  FROM community_members cm
  WHERE cm.community_id = _community_id AND cm.role = 'owner'
  LIMIT 1;

  IF _owner_id IS NULL THEN
    RAISE EXCEPTION 'Community owner not found';
  END IF;

  -- If user IS the owner, raise error (owner doesn't message themselves)
  IF _profile_id = _owner_id THEN
    RAISE EXCEPTION 'Owner cannot create conversation with themselves';
  END IF;

  -- Find existing conversation between these two users in this community
  SELECT c.id INTO _conv_id
  FROM conversations c
  WHERE c.community_id = _community_id
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp1
      WHERE cp1.conversation_id = c.id AND cp1.user_id = _profile_id
    )
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = c.id AND cp2.user_id = _owner_id
    )
  LIMIT 1;

  -- If found, return it
  IF _conv_id IS NOT NULL THEN
    RETURN _conv_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (community_id)
  VALUES (_community_id)
  RETURNING id INTO _conv_id;

  -- Add both participants
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (_conv_id, _profile_id), (_conv_id, _owner_id);

  RETURN _conv_id;
END;
$$;

-- 2. Fix messages UPDATE policy: allow conversation participants to mark messages as read
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

CREATE POLICY "Participants can update messages in their conversations"
ON public.messages
FOR UPDATE
TO authenticated
USING (is_conversation_participant(conversation_id))
WITH CHECK (is_conversation_participant(conversation_id));
