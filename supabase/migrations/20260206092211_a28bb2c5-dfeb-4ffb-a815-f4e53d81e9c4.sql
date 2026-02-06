-- Fix security issues: Add explicit policies and improve RLS

-- 1. Add explicit UPDATE/DELETE policies for lesson_progress (immutable records)
CREATE POLICY "Lesson progress cannot be updated"
  ON public.lesson_progress FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Only admins can delete lesson progress"
  ON public.lesson_progress FOR DELETE
  TO authenticated
  USING (is_admin());

-- 2. Fix notifications INSERT policy - restrict to user's own records
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Users and system can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = get_current_profile_id());

-- 3. Fix certificates INSERT policy - only service role can insert (via edge function)
-- Use a check that will always fail for normal users but service role bypasses RLS
DROP POLICY IF EXISTS "System can create certificates" ON public.certificates;
CREATE POLICY "Only service role can create certificates"
  ON public.certificates FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- 4. Fix community owner self-assignment by creating a trigger
-- First, create the trigger function
CREATE OR REPLACE FUNCTION add_community_owner_as_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO community_members (community_id, user_id, role, is_approved)
  VALUES (NEW.id, NEW.owner_id, 'owner', true);
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_community_created ON public.communities;
CREATE TRIGGER on_community_created
  AFTER INSERT ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION add_community_owner_as_member();

-- Update the community_members INSERT policy to remove owner self-assignment
DROP POLICY IF EXISTS "Add community members" ON public.community_members;
CREATE POLICY "Add community members"
  ON public.community_members FOR INSERT
  TO authenticated
  WITH CHECK (
    is_community_admin(community_id)
    OR (
      user_id = get_current_profile_id()
      AND role = 'member'
      AND EXISTS (SELECT 1 FROM communities WHERE id = community_id AND is_public = true)
    )
  );