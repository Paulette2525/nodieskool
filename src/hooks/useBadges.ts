import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  criteria: string | null;
  points_required: number;
  created_at: string;
}

interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  badge: Badge;
}

export function useBadges(userId?: string) {
  const { profile } = useAuth();
  const targetUserId = userId || profile?.id;

  const { data: allBadges = [], isLoading: loadingBadges } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("points_required", { ascending: true });

      if (error) throw error;
      return data as Badge[];
    },
  });

  const { data: userBadges = [], isLoading: loadingUserBadges } = useQuery({
    queryKey: ["user-badges", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("user_badges")
        .select(`
          *,
          badge:badges(*)
        `)
        .eq("user_id", targetUserId)
        .order("awarded_at", { ascending: false });

      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!targetUserId,
  });

  const earnedBadgeIds = userBadges.map((ub) => ub.badge_id);

  return {
    allBadges,
    userBadges,
    earnedBadgeIds,
    isLoading: loadingBadges || loadingUserBadges,
  };
}
