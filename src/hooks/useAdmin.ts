import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Member {
  id: string;
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  points: number;
  level: number;
  created_at: string;
  roles: string[];
}

export function useAdmin() {
  const { profile, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ["admin-members"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: roles } = await supabase.from("user_roles").select("*");

      return profiles.map((p) => ({
        ...p,
        roles: roles?.filter((r) => r.user_id === p.user_id).map((r) => r.role) ?? [],
      })) as Member[];
    },
    enabled: isAdmin,
  });

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [postsRes, membersRes, coursesRes, eventsRes] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("courses").select("id", { count: "exact" }),
        supabase.from("events").select("id", { count: "exact" }),
      ]);

      return {
        postsCount: postsRes.count ?? 0,
        membersCount: membersRes.count ?? 0,
        coursesCount: coursesRes.count ?? 0,
        eventsCount: eventsRes.count ?? 0,
      };
    },
    enabled: isAdmin,
  });

  const awardPoints = useMutation({
    mutationFn: async ({ userId, points, reason }: { userId: string; points: number; reason: string }) => {
      if (!profile) throw new Error("Not authenticated");

      // Use server-side RPC function for atomic point updates
      const { error } = await supabase.rpc('update_user_points', {
        _user_id: userId,
        _points: points,
        _reason: reason,
        _awarded_by: profile.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      toast.success("Points awarded!");
    },
    onError: (error) => {
      toast.error("Failed to award points: " + error.message);
    },
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role, action }: { userId: string; role: "admin" | "moderator" | "member"; action: "add" | "remove" }) => {
      if (action === "add") {
        const { error } = await supabase.from("user_roles").insert({
          user_id: userId,
          role,
        });
        if (error && !error.message.includes("duplicate")) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", role);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      toast.success("Role updated!");
    },
    onError: (error) => {
      toast.error("Failed to update role: " + error.message);
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted!");
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      // Delete user's profile (cascades to related data via foreign keys)
      const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Utilisateur supprimé !");
    },
    onError: (error) => {
      toast.error("Échec de la suppression : " + error.message);
    },
  });

  return {
    members: membersQuery.data ?? [],
    stats: statsQuery.data,
    isLoading: membersQuery.isLoading,
    updateUserRole,
    deletePost,
    deleteUser,
  };
}
