import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  points: number;
  level: number;
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      // First, get admin user_ids to exclude
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      const adminUserIds = adminRoles?.map((r) => r.user_id) || [];

      // Fetch profiles excluding admins
      let query = supabase
        .from("profiles")
        .select("id, user_id, username, full_name, avatar_url, points, level")
        .order("points", { ascending: false })
        .limit(50);

      const { data, error } = await query;

      if (error) throw error;

      // Filter out admin profiles client-side
      const filteredData = (data || []).filter(
        (profile) => !adminUserIds.includes(profile.user_id)
      );

      return filteredData as LeaderboardEntry[];
    },
  });
}
