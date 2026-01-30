-- Create community_settings table for storing general settings
CREATE TABLE public.community_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view settings
CREATE POLICY "Settings are viewable by authenticated users" 
ON public.community_settings 
FOR SELECT 
USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings" 
ON public.community_settings 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Insert default settings
INSERT INTO public.community_settings (setting_key, setting_value) VALUES
  ('community_name', 'Growth Academy'),
  ('community_description', 'La communauté des entrepreneurs ambitieux'),
  ('welcome_message', 'Bienvenue dans notre communauté !'),
  ('primary_color', '#8B5CF6'),
  ('enable_notifications', 'true'),
  ('enable_leaderboard', 'true'),
  ('enable_gamification', 'true'),
  ('require_email_verification', 'true'),
  ('allow_public_profiles', 'true');

-- Add trigger for updated_at
CREATE TRIGGER update_community_settings_updated_at
BEFORE UPDATE ON public.community_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();