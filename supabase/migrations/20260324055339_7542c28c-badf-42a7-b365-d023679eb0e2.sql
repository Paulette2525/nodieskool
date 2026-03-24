
-- Add invite_code column to communities
ALTER TABLE public.communities ADD COLUMN invite_code text UNIQUE;

-- Create a function to generate a random invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE sql
AS $$
  SELECT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
$$;

-- Create a secure RPC to join a community by invite code
CREATE OR REPLACE FUNCTION public.join_community_by_code(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _community_id uuid;
  _community_name text;
  _is_public boolean;
  _profile_id uuid;
BEGIN
  _profile_id := get_current_profile_id();
  IF _profile_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id, name, is_public INTO _community_id, _community_name, _is_public
  FROM public.communities
  WHERE invite_code = upper(trim(_code)) AND is_active = true;

  IF _community_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code invalide');
  END IF;

  -- Check if already a member
  IF EXISTS (SELECT 1 FROM public.community_members WHERE community_id = _community_id AND user_id = _profile_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Vous êtes déjà membre de cette communauté');
  END IF;

  -- Insert member (approved if public, pending if private)
  INSERT INTO public.community_members (community_id, user_id, role, is_approved)
  VALUES (_community_id, _profile_id, 'member', _is_public);

  RETURN jsonb_build_object('success', true, 'community_name', _community_name, 'is_approved', _is_public);
END;
$$;

-- Update communities_public view to include invite_code only for owners (don't expose it publicly)
-- The invite_code stays hidden from the public view - owners access it via the communities table directly
