-- Add ON DELETE CASCADE to all tables referencing communities
ALTER TABLE public.community_members DROP CONSTRAINT IF EXISTS community_members_community_id_fkey;
ALTER TABLE public.community_members ADD CONSTRAINT community_members_community_id_fkey 
  FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_community_id_fkey;
ALTER TABLE public.posts ADD CONSTRAINT posts_community_id_fkey 
  FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;

ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_community_id_fkey;
ALTER TABLE public.courses ADD CONSTRAINT courses_community_id_fkey 
  FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_community_id_fkey;
ALTER TABLE public.events ADD CONSTRAINT events_community_id_fkey 
  FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;

ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_community_id_fkey;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_community_id_fkey 
  FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;

ALTER TABLE public.badges DROP CONSTRAINT IF EXISTS badges_community_id_fkey;
ALTER TABLE public.badges ADD CONSTRAINT badges_community_id_fkey 
  FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;

ALTER TABLE public.community_settings DROP CONSTRAINT IF EXISTS community_settings_community_id_fkey;
ALTER TABLE public.community_settings ADD CONSTRAINT community_settings_community_id_fkey 
  FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;