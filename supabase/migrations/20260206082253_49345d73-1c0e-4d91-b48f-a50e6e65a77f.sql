-- Create table to track admin code verification attempts for rate limiting
CREATE TABLE IF NOT EXISTS public.admin_code_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  attempted_at timestamp with time zone NOT NULL DEFAULT now(),
  was_successful boolean NOT NULL DEFAULT false
);

-- Add index for efficient cleanup and lookups
CREATE INDEX idx_admin_code_attempts_ip_time ON public.admin_code_attempts(ip_address, attempted_at);

-- Enable RLS but deny all access from client (server-only table)
ALTER TABLE public.admin_code_attempts ENABLE ROW LEVEL SECURITY;

-- No policies = no client access, only service role can access

-- Create a function to clean up old attempts (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_admin_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admin_code_attempts
  WHERE attempted_at < now() - interval '1 hour';
END;
$$;

-- Create a view for communities that excludes owner_id for public access
CREATE OR REPLACE VIEW public.communities_public
WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  slug,
  description,
  logo_url,
  cover_url,
  primary_color,
  is_public,
  is_active,
  created_at,
  updated_at
FROM public.communities
WHERE is_public = true OR is_community_member(id);

-- Grant select on the view to authenticated users
GRANT SELECT ON public.communities_public TO authenticated;
GRANT SELECT ON public.communities_public TO anon;