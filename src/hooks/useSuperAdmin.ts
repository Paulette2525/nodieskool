 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 export interface PlatformUser {
   id: string;
   user_id: string;
   username: string;
   full_name: string | null;
   avatar_url: string | null;
   points: number;
   level: number;
   created_at: string;
   platform_role: string | null;
   communities_count: number;
 }
 
 export interface PlatformCommunity {
   id: string;
   name: string;
   slug: string;
   description: string | null;
   logo_url: string | null;
   cover_url: string | null;
   is_public: boolean;
   is_active: boolean;
   created_at: string;
   owner_id: string;
   owner_username: string;
   owner_full_name: string | null;
   members_count: number;
   posts_count: number;
   courses_count: number;
   events_count: number;
 }
 
 export interface PlatformPost {
   id: string;
   content: string;
   image_url: string | null;
   likes_count: number;
   comments_count: number;
   created_at: string;
   user_id: string;
   author_username: string;
   author_full_name: string | null;
   community_id: string | null;
   community_name: string | null;
   community_slug: string | null;
 }
 
export interface PlatformStats {
  totalUsers: number;
  totalCommunities: number;
  activeCommunities: number;
  totalPosts: number;
  totalCourses: number;
  totalEvents: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalLessonsCompleted: number;
  totalQuizzesPassed: number;
}

export interface ActivityItem {
  id: string;
  type: "points" | "lesson" | "quiz" | "event_register";
  user_name: string;
  detail: string;
  created_at: string;
  meta?: Record<string, any>;
}
 
 export function useSuperAdmin(enabled: boolean = true) {
   const queryClient = useQueryClient();
 
   // Fetch all platform stats
   const statsQuery = useQuery({
     queryKey: ["super-admin-stats"],
     queryFn: async (): Promise<PlatformStats> => {
       const today = new Date();
       today.setHours(0, 0, 0, 0);
       const weekAgo = new Date(today);
       weekAgo.setDate(weekAgo.getDate() - 7);
 
        const [users, communities, posts, courses, events, newToday, newWeek, lessonsCompleted, quizzesPassed] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("communities").select("id, is_active"),
          supabase.from("posts").select("id", { count: "exact", head: true }),
          supabase.from("courses").select("id", { count: "exact", head: true }),
          supabase.from("events").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
          supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
          supabase.from("lesson_progress").select("id", { count: "exact", head: true }),
          supabase.from("quiz_attempts").select("id", { count: "exact", head: true }).eq("passed", true),
        ]);
 
       const communityData = communities.data ?? [];
       const activeCommunities = communityData.filter(c => c.is_active).length;
 
       return {
         totalUsers: users.count ?? 0,
         totalCommunities: communityData.length,
         activeCommunities,
         totalPosts: posts.count ?? 0,
         totalCourses: courses.count ?? 0,
         totalEvents: events.count ?? 0,
         newUsersToday: newToday.count ?? 0,
         newUsersThisWeek: newWeek.count ?? 0,
       };
     },
     enabled,
   });
 
   // Fetch all users with their community counts
   const usersQuery = useQuery({
     queryKey: ["super-admin-users"],
     queryFn: async (): Promise<PlatformUser[]> => {
       const { data: profiles, error: profilesError } = await supabase
         .from("profiles")
         .select("*")
         .order("created_at", { ascending: false });
 
       if (profilesError) throw profilesError;
 
       const { data: roles } = await supabase.from("user_roles").select("user_id, role");
       const { data: memberships } = await supabase.from("community_members").select("user_id");
 
       const membershipCounts = (memberships ?? []).reduce((acc, m) => {
         acc[m.user_id] = (acc[m.user_id] || 0) + 1;
         return acc;
       }, {} as Record<string, number>);
 
       const roleMap = (roles ?? []).reduce((acc, r) => {
         if (r.role === "admin") acc[r.user_id] = "admin";
         else if (!acc[r.user_id]) acc[r.user_id] = r.role;
         return acc;
       }, {} as Record<string, string>);
 
       return (profiles ?? []).map(p => ({
         id: p.id,
         user_id: p.user_id,
         username: p.username,
         full_name: p.full_name,
         avatar_url: p.avatar_url,
         points: p.points,
         level: p.level,
         created_at: p.created_at,
         platform_role: roleMap[p.user_id] ?? null,
         communities_count: membershipCounts[p.id] ?? 0,
       }));
     },
     enabled,
   });
 
   // Fetch all communities with stats
   const communitiesQuery = useQuery({
     queryKey: ["super-admin-communities"],
     queryFn: async (): Promise<PlatformCommunity[]> => {
       const { data: communities, error } = await supabase
         .from("communities")
         .select(`
           *,
           owner:profiles!communities_owner_id_fkey(username, full_name)
         `)
         .order("created_at", { ascending: false });
 
       if (error) throw error;
 
       const communityIds = (communities ?? []).map(c => c.id);
 
       const [members, posts, courses, events] = await Promise.all([
         supabase.from("community_members").select("community_id"),
         supabase.from("posts").select("community_id").in("community_id", communityIds),
         supabase.from("courses").select("community_id").in("community_id", communityIds),
         supabase.from("events").select("community_id").in("community_id", communityIds),
       ]);
 
       const countBy = (data: any[], key: string) => 
         (data ?? []).reduce((acc, item) => {
           acc[item[key]] = (acc[item[key]] || 0) + 1;
           return acc;
         }, {} as Record<string, number>);
 
       const memberCounts = countBy(members.data ?? [], "community_id");
       const postCounts = countBy(posts.data ?? [], "community_id");
       const courseCounts = countBy(courses.data ?? [], "community_id");
       const eventCounts = countBy(events.data ?? [], "community_id");
 
       return (communities ?? []).map(c => ({
         id: c.id,
         name: c.name,
         slug: c.slug,
         description: c.description,
         logo_url: c.logo_url,
         cover_url: c.cover_url,
         is_public: c.is_public,
         is_active: c.is_active,
         created_at: c.created_at,
         owner_id: c.owner_id,
         owner_username: (c.owner as any)?.username ?? "Unknown",
         owner_full_name: (c.owner as any)?.full_name ?? null,
         members_count: memberCounts[c.id] ?? 0,
         posts_count: postCounts[c.id] ?? 0,
         courses_count: courseCounts[c.id] ?? 0,
         events_count: eventCounts[c.id] ?? 0,
       }));
     },
     enabled,
   });
 
   // Fetch recent posts across all communities
   const postsQuery = useQuery({
     queryKey: ["super-admin-posts"],
     queryFn: async (): Promise<PlatformPost[]> => {
       const { data, error } = await supabase
         .from("posts")
         .select(`
           *,
           author:profiles!posts_user_id_fkey(username, full_name),
           community:communities(name, slug)
         `)
         .order("created_at", { ascending: false })
         .limit(100);
 
       if (error) throw error;
 
       return (data ?? []).map(p => ({
         id: p.id,
         content: p.content,
         image_url: p.image_url,
         likes_count: p.likes_count,
         comments_count: p.comments_count,
         created_at: p.created_at,
         user_id: p.user_id,
         author_username: (p.author as any)?.username ?? "Unknown",
         author_full_name: (p.author as any)?.full_name ?? null,
         community_id: p.community_id,
         community_name: (p.community as any)?.name ?? null,
         community_slug: (p.community as any)?.slug ?? null,
       }));
     },
     enabled,
   });
 
   // Toggle community active status
   const toggleCommunityActive = useMutation({
     mutationFn: async ({ communityId, isActive }: { communityId: string; isActive: boolean }) => {
       const { error } = await supabase
         .from("communities")
         .update({ is_active: isActive })
         .eq("id", communityId);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["super-admin-communities"] });
       queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] });
       toast.success("Statut de la communauté mis à jour");
     },
     onError: (error) => {
       toast.error("Erreur: " + error.message);
     },
   });
 
   // Delete community
   const deleteCommunity = useMutation({
     mutationFn: async (communityId: string) => {
       const { error } = await supabase
         .from("communities")
         .delete()
         .eq("id", communityId);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["super-admin-communities"] });
       queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] });
       toast.success("Communauté supprimée");
     },
     onError: (error) => {
       toast.error("Erreur: " + error.message);
     },
   });
 
   // Update user role
   const updateUserRole = useMutation({
     mutationFn: async ({ userId, role, action }: { userId: string; role: "admin" | "moderator" | "member"; action: "add" | "remove" }) => {
       if (action === "add") {
         const { error } = await supabase.from("user_roles").upsert({
           user_id: userId,
           role,
         }, { onConflict: "user_id,role" });
         if (error) throw error;
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
       queryClient.invalidateQueries({ queryKey: ["super-admin-users"] });
       toast.success("Rôle mis à jour");
     },
     onError: (error) => {
       toast.error("Erreur: " + error.message);
     },
   });
 
   // Delete user
   const deleteUser = useMutation({
     mutationFn: async (profileId: string) => {
       const { error } = await supabase
         .from("profiles")
         .delete()
         .eq("id", profileId);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["super-admin-users"] });
       queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] });
       toast.success("Utilisateur supprimé");
     },
     onError: (error) => {
       toast.error("Erreur: " + error.message);
     },
   });
 
   // Delete post
   const deletePost = useMutation({
     mutationFn: async (postId: string) => {
       const { error } = await supabase.from("posts").delete().eq("id", postId);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["super-admin-posts"] });
       queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] });
       toast.success("Post supprimé");
     },
     onError: (error) => {
       toast.error("Erreur: " + error.message);
     },
   });
 
   return {
     stats: statsQuery.data,
     users: usersQuery.data ?? [],
     communities: communitiesQuery.data ?? [],
     posts: postsQuery.data ?? [],
     isLoading: statsQuery.isLoading || usersQuery.isLoading || communitiesQuery.isLoading,
     toggleCommunityActive,
     deleteCommunity,
     updateUserRole,
     deleteUser,
     deletePost,
     refetch: () => {
       queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] });
       queryClient.invalidateQueries({ queryKey: ["super-admin-users"] });
       queryClient.invalidateQueries({ queryKey: ["super-admin-communities"] });
       queryClient.invalidateQueries({ queryKey: ["super-admin-posts"] });
     },
   };
 }