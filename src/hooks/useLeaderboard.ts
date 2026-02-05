import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  id: string;
   user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  points: number;
  level: number;
}

 export function useLeaderboard(communityId?: string | null) {
  return useQuery({
     queryKey: ["leaderboard", communityId],
    queryFn: async () => {
       if (communityId) {
         // For community-specific leaderboard, get member profiles
         const { data: members, error: memberError } = await supabase
           .from("community_members")
           .select(`
             user_id,
             profiles (
               id,
               user_id,
               username,
               full_name,
               avatar_url,
               points,
               level
             )
           `)
           .eq("community_id", communityId)
           .eq("is_approved", true);

         if (memberError) throw memberError;

         const profiles = (members || [])
           .filter(m => m.profiles)
           .map(m => m.profiles as unknown as LeaderboardEntry)
           .sort((a, b) => b.points - a.points)
           .slice(0, 50);

         return profiles;
       } else {
         // Global leaderboard - exclude admins
         const { data: adminRoles } = await supabase
           .from("user_roles")
           .select("user_id")
           .eq("role", "admin");

         const adminUserIds = adminRoles?.map((r) => r.user_id) || [];

         const { data, error } = await supabase
           .from("profiles")
           .select("id, user_id, username, full_name, avatar_url, points, level")
           .order("points", { ascending: false })
           .limit(50);

         if (error) throw error;

         const filteredData = (data || []).filter(
           (profile) => !adminUserIds.includes(profile.user_id)
         );

         return filteredData as LeaderboardEntry[];
       }
    },
  });
}
