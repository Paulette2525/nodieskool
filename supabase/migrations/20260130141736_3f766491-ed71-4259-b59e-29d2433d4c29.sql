-- Fix user_roles RLS: Add WITH CHECK for admin INSERT operations
-- Drop the existing policy and recreate with proper check

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Recreate with both USING and WITH CHECK
CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Also ensure the is_admin function works correctly by checking auth.uid()
-- This should already be correct, but let's verify the function exists