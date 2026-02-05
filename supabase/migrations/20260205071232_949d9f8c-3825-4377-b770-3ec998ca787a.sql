
-- Fix overly permissive RLS policy on subscriptions
-- Only allow users to view their own subscription
-- Writes are handled by service role from edge functions

DROP POLICY IF EXISTS "System manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "View own subscription" ON public.subscriptions;

-- Users can view their own subscription
CREATE POLICY "View own subscription"
  ON public.subscriptions FOR SELECT
  USING (user_id = get_current_profile_id());

-- Users can insert their own subscription (for initial creation via trigger)
CREATE POLICY "Insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (user_id = get_current_profile_id());

-- No UPDATE or DELETE from client side - handled by edge functions with service role
