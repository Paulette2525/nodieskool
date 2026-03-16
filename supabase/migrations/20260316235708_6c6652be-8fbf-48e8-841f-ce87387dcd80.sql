
-- 1. Function: is_course_community_admin(course_id)
CREATE OR REPLACE FUNCTION public.is_course_community_admin(_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = _course_id
      AND c.community_id IS NOT NULL
      AND is_community_admin(c.community_id)
  )
$$;

-- 2. Function: is_module_community_admin(module_id)
CREATE OR REPLACE FUNCTION public.is_module_community_admin(_module_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = _module_id
      AND c.community_id IS NOT NULL
      AND is_community_admin(c.community_id)
  )
$$;

-- 3. Update modules RLS policy
DROP POLICY IF EXISTS "Admins/Mods can manage modules" ON public.modules;
CREATE POLICY "Admins/Mods can manage modules" ON public.modules
FOR ALL TO authenticated
USING (is_moderator_or_admin() OR is_course_community_admin(course_id))
WITH CHECK (is_moderator_or_admin() OR is_course_community_admin(course_id));

-- 4. Update lessons RLS policy
DROP POLICY IF EXISTS "Admins/Mods can manage lessons" ON public.lessons;
CREATE POLICY "Admins/Mods can manage lessons" ON public.lessons
FOR ALL TO authenticated
USING (is_moderator_or_admin() OR is_module_community_admin(module_id))
WITH CHECK (is_moderator_or_admin() OR is_module_community_admin(module_id));
