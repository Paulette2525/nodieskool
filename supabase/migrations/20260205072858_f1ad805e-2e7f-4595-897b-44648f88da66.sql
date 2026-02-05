-- Drop existing policy for community_members INSERT
DROP POLICY IF EXISTS "Add community members" ON public.community_members;

-- Create new policy that allows:
-- 1. Community admins to add members
-- 2. Users to join public communities
-- 3. Community owner to add themselves when creating (owner_id matches in communities table)
CREATE POLICY "Add community members"
ON public.community_members FOR INSERT
TO authenticated
WITH CHECK (
  is_community_admin(community_id)
  OR (
    user_id = get_current_profile_id()
    AND role = 'member'
    AND EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_members.community_id
      AND communities.is_public = true
    )
  )
  OR (
    user_id = get_current_profile_id()
    AND role = 'owner'
    AND EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_members.community_id
      AND communities.owner_id = get_current_profile_id()
    )
  )
);