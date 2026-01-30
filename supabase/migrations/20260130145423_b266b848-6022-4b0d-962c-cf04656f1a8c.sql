-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'like', 'comment', 'follow', 'event', 'badge', 'points'
  title TEXT NOT NULL,
  message TEXT,
  reference_id UUID, -- ID du post, commentaire, etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (user_id = get_current_profile_id());

-- System/triggers can create notifications (using security definer functions)
CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (user_id = get_current_profile_id());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (user_id = get_current_profile_id());

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL, -- Lucide icon name
  criteria TEXT,
  points_required INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on badges
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Badges are viewable by everyone
CREATE POLICY "Badges are viewable by authenticated users"
ON public.badges FOR SELECT
USING (true);

-- Only admins can manage badges
CREATE POLICY "Admins can manage badges"
ON public.badges FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create user_badges junction table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS on user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- User badges are viewable by everyone
CREATE POLICY "User badges are viewable by authenticated users"
ON public.user_badges FOR SELECT
USING (true);

-- Only admins/moderators can award badges
CREATE POLICY "Admins can award badges"
ON public.user_badges FOR INSERT
WITH CHECK (is_moderator_or_admin());

-- Admins can remove badges
CREATE POLICY "Admins can remove badges"
ON public.user_badges FOR DELETE
USING (is_moderator_or_admin());

-- Insert default badges
INSERT INTO public.badges (name, description, icon, criteria, points_required) VALUES
  ('Nouveau membre', 'Bienvenue dans la communauté !', 'Star', 'Créer un compte', 0),
  ('Premier post', 'Vous avez publié votre premier post', 'MessageSquare', 'Publier un post', 0),
  ('Contributeur actif', 'Vous avez atteint 100 points', 'Award', 'Atteindre 100 points', 100),
  ('Expert', 'Vous avez atteint 500 points', 'Trophy', 'Atteindre 500 points', 500),
  ('Maître', 'Vous avez atteint 1000 points', 'Crown', 'Atteindre 1000 points', 1000),
  ('Apprenant dévoué', 'Vous avez terminé 10 leçons', 'BookOpen', 'Terminer 10 leçons', 0),
  ('Social butterfly', 'Vous avez reçu 50 likes', 'Heart', 'Recevoir 50 likes', 0);

-- Create function to send notification
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _type TEXT,
  _title TEXT,
  _message TEXT DEFAULT NULL,
  _reference_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, reference_id)
  VALUES (_user_id, _type, _title, _message, _reference_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger to notify when someone likes a post
CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_owner_id UUID;
  liker_name TEXT;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Don't notify if user likes their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get liker's name
  SELECT COALESCE(full_name, username) INTO liker_name FROM public.profiles WHERE id = NEW.user_id;
  
  -- Create notification
  PERFORM public.create_notification(
    post_owner_id,
    'like',
    'Nouveau like',
    liker_name || ' a aimé votre publication',
    NEW.post_id
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_like_notify
AFTER INSERT ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.notify_post_like();

-- Trigger to notify when someone comments on a post
CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_owner_id UUID;
  commenter_name TEXT;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Don't notify if user comments on their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get commenter's name
  SELECT COALESCE(full_name, username) INTO commenter_name FROM public.profiles WHERE id = NEW.user_id;
  
  -- Create notification
  PERFORM public.create_notification(
    post_owner_id,
    'comment',
    'Nouveau commentaire',
    commenter_name || ' a commenté votre publication',
    NEW.post_id
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_comment_notify
AFTER INSERT ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_post_comment();