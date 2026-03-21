DROP POLICY "Add community members" ON public.community_members;
CREATE POLICY "Add community members" ON public.community_members
FOR INSERT TO authenticated
WITH CHECK (
  is_community_admin(community_id)
  OR (
    user_id = get_current_profile_id()
    AND role = 'member'::community_role
  )
);