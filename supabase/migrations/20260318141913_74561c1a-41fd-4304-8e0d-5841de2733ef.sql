
ALTER TABLE public.conversations ADD COLUMN community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE;
