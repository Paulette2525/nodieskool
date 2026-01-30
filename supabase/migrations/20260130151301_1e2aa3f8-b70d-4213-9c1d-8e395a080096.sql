-- Drop existing moderator policies
DROP POLICY IF EXISTS "Only moderators can delete posts" ON public.posts;
DROP POLICY IF EXISTS "Only moderators can update posts" ON public.posts;
DROP POLICY IF EXISTS "Only moderators can delete comments" ON public.post_comments;
DROP POLICY IF EXISTS "Only moderators can update comments" ON public.post_comments;

-- Create new policies that only allow admins to delete and update posts
CREATE POLICY "Only admins can delete posts" 
ON public.posts FOR DELETE 
USING (is_admin());

CREATE POLICY "Only admins can update posts" 
ON public.posts FOR UPDATE 
USING (is_admin());

-- Create new policies that only allow admins to delete and update comments
CREATE POLICY "Only admins can delete comments" 
ON public.post_comments FOR DELETE 
USING (is_admin());

CREATE POLICY "Only admins can update comments" 
ON public.post_comments FOR UPDATE 
USING (is_admin());