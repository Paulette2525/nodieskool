CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions FOR SELECT TO authenticated
  USING (user_id = get_current_profile_id());

CREATE POLICY "Users can insert own push subscriptions"
  ON public.push_subscriptions FOR INSERT TO authenticated
  WITH CHECK (user_id = get_current_profile_id());

CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE TO authenticated
  USING (user_id = get_current_profile_id());

CREATE OR REPLACE FUNCTION public.trigger_push_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://sgygpzrtityhdbeqjych.supabase.co/functions/v1/send-push-notification',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNneWdwenJ0aXR5aGRiZXFqeWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NzU5NDEsImV4cCI6MjA4NTM1MTk0MX0.oF470IzIpMn8iBf9KkllWJIE7w67fCV70ySYISmOV2s"}'::jsonb,
    body := jsonb_build_object(
      'user_id', NEW.user_id::text,
      'title', NEW.title,
      'message', COALESCE(NEW.message, ''),
      'reference_id', COALESCE(NEW.reference_id::text, '')
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_notification_created
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_push_notification();