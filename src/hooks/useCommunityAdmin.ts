import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { toast } from "sonner";

export interface CommunityMember {
  id: string;
  user_id: string;
  role: "owner" | "admin" | "moderator" | "member";
  joined_at: string;
  is_approved: boolean;
  profile: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface CommunityStats {
  membersCount: number;
  postsCount: number;
  coursesCount: number;
}

export function useCommunityAdmin() {
  const { communityId, isAdmin } = useCommunityContext();
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ["community-admin-members", communityId],
    queryFn: async () => {
      if (!communityId) return [];
      const { data, error } = await supabase
        .from("community_members")
        .select(`
          id, user_id, role, joined_at, is_approved,
          profile:profiles!community_members_user_id_fkey (
            id, username, full_name, avatar_url, points, level
          )
        `)
        .eq("community_id", communityId)
        .order("joined_at", { ascending: false });
      if (error) throw error;
      return data as unknown as CommunityMember[];
    },
    enabled: !!communityId && isAdmin,
  });

  const statsQuery = useQuery({
    queryKey: ["community-admin-stats", communityId],
    queryFn: async (): Promise<CommunityStats> => {
      if (!communityId) return { membersCount: 0, postsCount: 0, coursesCount: 0 };
      const [membersRes, postsRes, coursesRes] = await Promise.all([
        supabase.from("community_members").select("id", { count: "exact", head: true }).eq("community_id", communityId).eq("is_approved", true),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("community_id", communityId),
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("community_id", communityId),
      ]);
      return {
        membersCount: membersRes.count ?? 0,
        postsCount: postsRes.count ?? 0,
        coursesCount: coursesRes.count ?? 0,
      };
    },
    enabled: !!communityId && isAdmin,
  });

  const coursesQuery = useQuery({
    queryKey: ["community-admin-courses", communityId],
    queryFn: async () => {
      if (!communityId) return [];
      const { data, error } = await supabase.from("courses").select("*").eq("community_id", communityId).order("order_index");
      if (error) throw error;
      return data;
    },
    enabled: !!communityId && isAdmin,
  });

  const postsQuery = useQuery({
    queryKey: ["community-admin-posts", communityId],
    queryFn: async () => {
      if (!communityId) return [];
      const { data, error } = await supabase
        .from("posts")
        .select(`*, profiles:user_id (username, full_name, avatar_url)`)
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!communityId && isAdmin,
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: "admin" | "moderator" | "member" }) => {
      const { error } = await supabase.from("community_members").update({ role }).eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-admin-members", communityId] });
      toast.success("Rôle mis à jour");
    },
    onError: (error) => { toast.error("Erreur: " + error.message); },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from("community_members").delete().eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-admin-members", communityId] });
      queryClient.invalidateQueries({ queryKey: ["community-admin-stats", communityId] });
      toast.success("Membre supprimé");
    },
    onError: (error) => { toast.error("Erreur: " + error.message); },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-admin-posts", communityId] });
      queryClient.invalidateQueries({ queryKey: ["community-admin-stats", communityId] });
      toast.success("Post supprimé");
    },
  });

  return {
    members: membersQuery.data ?? [],
    stats: statsQuery.data,
    courses: coursesQuery.data ?? [],
    posts: postsQuery.data ?? [],
    isLoading: membersQuery.isLoading || statsQuery.isLoading,
    updateMemberRole,
    removeMember,
    deletePost,
    communityId,
  };
}
