
-- 1. Nouvelle publication dans une communauté
CREATE OR REPLACE FUNCTION public.notify_new_community_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  author_name TEXT;
  community_name TEXT;
  member RECORD;
BEGIN
  -- Only for community posts
  IF NEW.community_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, username) INTO author_name FROM public.profiles WHERE id = NEW.user_id;
  SELECT name INTO community_name FROM public.communities WHERE id = NEW.community_id;

  FOR member IN
    SELECT user_id FROM public.community_members
    WHERE community_id = NEW.community_id AND user_id != NEW.user_id
  LOOP
    PERFORM public.create_notification(
      member.user_id,
      'new_post',
      'Nouvelle publication',
      author_name || ' a publié dans ' || community_name,
      NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_community_post
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_community_post();

-- 2. Nouveau cours publié
CREATE OR REPLACE FUNCTION public.notify_course_published()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  community_name TEXT;
  member RECORD;
BEGIN
  -- Only when is_published changes from false to true with a community
  IF OLD.is_published = true OR NEW.is_published = false OR NEW.community_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT name INTO community_name FROM public.communities WHERE id = NEW.community_id;

  FOR member IN
    SELECT user_id FROM public.community_members
    WHERE community_id = NEW.community_id
  LOOP
    PERFORM public.create_notification(
      member.user_id,
      'new_course',
      'Nouveau cours disponible',
      NEW.title || ' est maintenant disponible dans ' || community_name,
      NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_course_published
AFTER UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.notify_course_published();

-- 3. Réponse à un commentaire
CREATE OR REPLACE FUNCTION public.notify_comment_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  parent_author_id UUID;
  replier_name TEXT;
BEGIN
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO parent_author_id FROM public.post_comments WHERE id = NEW.parent_id;

  -- Don't notify if replying to own comment
  IF parent_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, username) INTO replier_name FROM public.profiles WHERE id = NEW.user_id;

  PERFORM public.create_notification(
    parent_author_id,
    'reply',
    'Nouvelle réponse',
    replier_name || ' a répondu à votre commentaire',
    NEW.post_id
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_comment_reply
AFTER INSERT ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_comment_reply();
