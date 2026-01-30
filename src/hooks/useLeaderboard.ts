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
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, points, level")
        .order("points", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as LeaderboardEntry[];
    },
  });
}
