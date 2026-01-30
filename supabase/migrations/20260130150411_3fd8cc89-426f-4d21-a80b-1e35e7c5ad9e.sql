-- Drop existing policies that allow users to delete/update their own posts and comments
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.post_comments;

-- Create new policies that only allow moderators/admins to delete and update posts
CREATE POLICY "Only moderators can delete posts" 
ON public.posts FOR DELETE 
USING (is_moderator_or_admin());

CREATE POLICY "Only moderators can update posts" 
ON public.posts FOR UPDATE 
USING (is_moderator_or_admin());

-- Create new policies that only allow moderators/admins to delete and update comments
CREATE POLICY "Only moderators can delete comments" 
ON public.post_comments FOR DELETE 
USING (is_moderator_or_admin());

CREATE POLICY "Only moderators can update comments" 
ON public.post_comments FOR UPDATE 
USING (is_moderator_or_admin());