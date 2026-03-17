CREATE OR REPLACE FUNCTION public.get_community_member_count(_community_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.community_members
  WHERE community_id = _community_id AND is_approved = true
$$;