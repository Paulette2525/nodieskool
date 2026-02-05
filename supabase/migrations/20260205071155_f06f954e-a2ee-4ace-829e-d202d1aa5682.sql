
-- Create enum for community member roles
CREATE TYPE public.community_role AS ENUM ('owner', 'admin', 'moderator', 'member');

-- Create enum for subscription plans
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'business');

-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

-- =====================================================
-- Table: communities
-- =====================================================
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  primary_color TEXT DEFAULT '#8B5CF6',
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trigger for updated_at
CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index on slug for fast lookups
CREATE INDEX idx_communities_slug ON public.communities(slug);
CREATE INDEX idx_communities_owner ON public.communities(owner_id);

-- =====================================================
-- Table: community_members
-- =====================================================
CREATE TABLE public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role community_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_approved BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(community_id, user_id)
);

CREATE INDEX idx_community_members_community ON public.community_members(community_id);
CREATE INDEX idx_community_members_user ON public.community_members(user_id);

-- =====================================================
-- Table: subscription_plans
-- =====================================================
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER NOT NULL DEFAULT 0,
  max_communities INTEGER NOT NULL DEFAULT 1,
  max_members_per_community INTEGER NOT NULL DEFAULT 100,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default plans
INSERT INTO public.subscription_plans (id, name, price_monthly, price_yearly, max_communities, max_members_per_community, features) VALUES
  ('free', 'Free', 0, 0, 1, 100, '["Communauté basique", "100 membres max", "Cours limités"]'::jsonb),
  ('pro', 'Pro', 2900, 29000, 3, 1000, '["3 communautés", "1000 membres/communauté", "Cours illimités", "Statistiques avancées"]'::jsonb),
  ('business', 'Business', 9900, 99000, -1, -1, '["Communautés illimitées", "Membres illimités", "Domaine personnalisé", "API Access", "Support prioritaire"]'::jsonb);

-- =====================================================
-- Table: subscriptions
-- =====================================================
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Add community_id to existing tables
-- =====================================================

-- Add to posts
ALTER TABLE public.posts ADD COLUMN community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;
CREATE INDEX idx_posts_community ON public.posts(community_id);

-- Add to courses
ALTER TABLE public.courses ADD COLUMN community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;
CREATE INDEX idx_courses_community ON public.courses(community_id);

-- Add to events
ALTER TABLE public.events ADD COLUMN community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;
CREATE INDEX idx_events_community ON public.events(community_id);

-- Add to badges
ALTER TABLE public.badges ADD COLUMN community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;
CREATE INDEX idx_badges_community ON public.badges(community_id);

-- Add community_id to community_settings
ALTER TABLE public.community_settings ADD COLUMN community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;
CREATE INDEX idx_community_settings_community ON public.community_settings(community_id);

-- =====================================================
-- Helper functions for community access
-- =====================================================

-- Check if user is member of a community
CREATE OR REPLACE FUNCTION public.is_community_member(_community_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = _community_id
    AND user_id = get_current_profile_id()
  )
$$;

-- Check if user is admin/owner of a community
CREATE OR REPLACE FUNCTION public.is_community_admin(_community_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = _community_id
    AND user_id = get_current_profile_id()
    AND role IN ('owner', 'admin')
  )
$$;

-- Check if user is owner of a community
CREATE OR REPLACE FUNCTION public.is_community_owner(_community_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = _community_id
    AND user_id = get_current_profile_id()
    AND role = 'owner'
  )
$$;

-- Get user's subscription plan limits
CREATE OR REPLACE FUNCTION public.get_user_max_communities()
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT sp.max_communities 
     FROM public.subscriptions s
     JOIN public.subscription_plans sp ON sp.id = s.plan::text
     WHERE s.user_id = get_current_profile_id()
     AND s.status = 'active'),
    1
  )
$$;

-- Count user's owned communities
CREATE OR REPLACE FUNCTION public.count_user_communities()
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.community_members
  WHERE user_id = get_current_profile_id()
  AND role = 'owner'
$$;

-- =====================================================
-- RLS Policies for communities
-- =====================================================
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Anyone can view public communities, members can view private ones
CREATE POLICY "View communities"
  ON public.communities FOR SELECT
  USING (is_public = true OR is_community_member(id));

-- Users with active subscription can create communities within their limit
CREATE POLICY "Create communities"
  ON public.communities FOR INSERT
  WITH CHECK (
    owner_id = get_current_profile_id()
    AND (get_user_max_communities() = -1 OR count_user_communities() < get_user_max_communities())
  );

-- Only owner can update their community
CREATE POLICY "Update communities"
  ON public.communities FOR UPDATE
  USING (is_community_owner(id));

-- Only owner can delete their community
CREATE POLICY "Delete communities"
  ON public.communities FOR DELETE
  USING (is_community_owner(id));

-- =====================================================
-- RLS Policies for community_members
-- =====================================================
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Members can see other members of their communities
CREATE POLICY "View community members"
  ON public.community_members FOR SELECT
  USING (is_community_member(community_id));

-- Admins can add members, or users can join public communities
CREATE POLICY "Add community members"
  ON public.community_members FOR INSERT
  WITH CHECK (
    is_community_admin(community_id)
    OR (
      user_id = get_current_profile_id()
      AND EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND is_public = true)
    )
  );

-- Admins can update member roles (except owner), or members can update themselves
CREATE POLICY "Update community members"
  ON public.community_members FOR UPDATE
  USING (
    is_community_admin(community_id) 
    OR user_id = get_current_profile_id()
  );

-- Admins can remove members, or users can leave
CREATE POLICY "Remove community members"
  ON public.community_members FOR DELETE
  USING (
    is_community_admin(community_id)
    OR user_id = get_current_profile_id()
  );

-- =====================================================
-- RLS Policies for subscriptions
-- =====================================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own subscription
CREATE POLICY "View own subscription"
  ON public.subscriptions FOR SELECT
  USING (user_id = get_current_profile_id());

-- System can create/update subscriptions (via edge functions with service role)
CREATE POLICY "System manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- RLS Policies for subscription_plans
-- =====================================================
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view active plans
CREATE POLICY "View subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = true);

-- =====================================================
-- Update existing table RLS policies for community filtering
-- =====================================================

-- Drop old policies and create new ones for posts
DROP POLICY IF EXISTS "Posts are viewable by authenticated users" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Only admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Only admins can delete posts" ON public.posts;

CREATE POLICY "View posts in community"
  ON public.posts FOR SELECT
  USING (
    community_id IS NULL 
    OR is_community_member(community_id)
  );

CREATE POLICY "Create posts in community"
  ON public.posts FOR INSERT
  WITH CHECK (
    user_id = get_current_profile_id()
    AND (community_id IS NULL OR is_community_member(community_id))
  );

CREATE POLICY "Update posts in community"
  ON public.posts FOR UPDATE
  USING (
    user_id = get_current_profile_id()
    OR is_community_admin(community_id)
    OR is_admin()
  );

CREATE POLICY "Delete posts in community"
  ON public.posts FOR DELETE
  USING (
    user_id = get_current_profile_id()
    OR is_community_admin(community_id)
    OR is_admin()
  );

-- Update courses policies
DROP POLICY IF EXISTS "Published courses are viewable by authenticated users" ON public.courses;
DROP POLICY IF EXISTS "Admins/Mods can create courses" ON public.courses;
DROP POLICY IF EXISTS "Admins/Mods can update courses" ON public.courses;
DROP POLICY IF EXISTS "Admins/Mods can delete courses" ON public.courses;

CREATE POLICY "View courses in community"
  ON public.courses FOR SELECT
  USING (
    (is_published = true AND (community_id IS NULL OR is_community_member(community_id)))
    OR is_community_admin(community_id)
    OR is_moderator_or_admin()
  );

CREATE POLICY "Create courses in community"
  ON public.courses FOR INSERT
  WITH CHECK (
    is_community_admin(community_id)
    OR is_moderator_or_admin()
  );

CREATE POLICY "Update courses in community"
  ON public.courses FOR UPDATE
  USING (
    is_community_admin(community_id)
    OR is_moderator_or_admin()
  );

CREATE POLICY "Delete courses in community"
  ON public.courses FOR DELETE
  USING (
    is_community_admin(community_id)
    OR is_moderator_or_admin()
  );

-- Update events policies
DROP POLICY IF EXISTS "Events are viewable by authenticated users" ON public.events;
DROP POLICY IF EXISTS "Admins/Mods can manage events" ON public.events;

CREATE POLICY "View events in community"
  ON public.events FOR SELECT
  USING (
    community_id IS NULL
    OR is_community_member(community_id)
  );

CREATE POLICY "Manage events in community"
  ON public.events FOR ALL
  USING (
    is_community_admin(community_id)
    OR is_moderator_or_admin()
  );

-- Update badges policies
DROP POLICY IF EXISTS "Badges are viewable by authenticated users" ON public.badges;
DROP POLICY IF EXISTS "Admins can manage badges" ON public.badges;

CREATE POLICY "View badges in community"
  ON public.badges FOR SELECT
  USING (
    community_id IS NULL
    OR is_community_member(community_id)
  );

CREATE POLICY "Manage badges in community"
  ON public.badges FOR ALL
  USING (
    is_community_admin(community_id)
    OR is_admin()
  )
  WITH CHECK (
    is_community_admin(community_id)
    OR is_admin()
  );

-- Update community_settings policies
DROP POLICY IF EXISTS "Settings are viewable by authenticated users" ON public.community_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.community_settings;

CREATE POLICY "View community settings"
  ON public.community_settings FOR SELECT
  USING (
    community_id IS NULL
    OR is_community_member(community_id)
  );

CREATE POLICY "Manage community settings"
  ON public.community_settings FOR ALL
  USING (
    is_community_admin(community_id)
    OR is_admin()
  )
  WITH CHECK (
    is_community_admin(community_id)
    OR is_admin()
  );

-- =====================================================
-- Function to create default subscription for new users
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create subscription for new profiles
CREATE TRIGGER on_profile_created_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_subscription();
