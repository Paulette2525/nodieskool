
-- Allow users to delete their own comments
DROP POLICY IF EXISTS "Only admins can delete comments" ON public.post_comments;
CREATE POLICY "Users can delete own comments or admins"
ON public.post_comments
FOR DELETE
TO public
USING (user_id = get_current_profile_id() OR is_admin());

-- Allow users to update their own comments
DROP POLICY IF EXISTS "Only admins can update comments" ON public.post_comments;
CREATE POLICY "Users can update own comments or admins"
ON public.post_comments
FOR UPDATE
TO public
USING (user_id = get_current_profile_id() OR is_admin());
