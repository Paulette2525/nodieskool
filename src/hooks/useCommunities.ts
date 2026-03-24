 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "./useAuth";
 import { toast } from "sonner";
 
 export interface Community {
   id: string;
   name: string;
   slug: string;
   description: string | null;
   logo_url: string | null;
   cover_url: string | null;
   primary_color: string | null;
   is_public: boolean;
   is_active: boolean;
   owner_id: string;
   created_at: string;
 }
 
 export interface CommunityWithRole extends Community {
   role: "owner" | "admin" | "moderator" | "member";
   member_count?: number;
 }
 
 export function useCommunities() {
   const { profile } = useAuth();
   const queryClient = useQueryClient();
 
   // Get communities the user is a member of
   const myCommunitiesQuery = useQuery({
     queryKey: ["my-communities", profile?.id],
     queryFn: async () => {
       if (!profile) return [];
 
       const { data, error } = await supabase
         .from("community_members")
         .select(`
           role,
           communities (*)
         `)
         .eq("user_id", profile.id)
         .eq("is_approved", true);
 
       if (error) throw error;
 
       return (data || []).map((item) => ({
         ...(item.communities as unknown as Community),
         role: item.role,
       })) as CommunityWithRole[];
     },
     enabled: !!profile,
   });
 
  // Get public communities for discovery (using secure view that excludes owner_id)
  const publicCommunitiesQuery = useQuery({
    queryKey: ["public-communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities_public")
        .select("id, name, slug, description, logo_url, cover_url, primary_color, is_public, is_active, created_at, updated_at")
        .eq("is_public", true)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      // Map to Community type, owner_id is not available from public view
      return (data || []).map(c => ({ ...c, owner_id: "" })) as Community[];
    },
  });
 
   // Create a new community
   const createCommunity = useMutation({
    mutationFn: async (data: {
      name: string;
      slug: string;
      description?: string;
      is_public?: boolean;
      logo_url?: string | null;
    }) => {
      if (!profile) throw new Error("Not authenticated");

      // Create the community
      const { data: community, error: communityError } = await supabase
        .from("communities")
        .insert({
          name: data.name,
          slug: data.slug.toLowerCase().replace(/\s+/g, "-"),
          description: data.description || null,
          is_public: data.is_public ?? true,
          owner_id: profile.id,
          logo_url: data.logo_url || null,
        })
        .select()
        .single();
 
        if (communityError) throw communityError;

        // Owner membership is auto-created by the `on_community_created` trigger
        return community;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["my-communities"] });
       toast.success("Communauté créée avec succès !");
     },
     onError: (error: Error) => {
       if (error.message.includes("duplicate")) {
         toast.error("Ce slug est déjà utilisé");
       } else {
         toast.error("Erreur lors de la création: " + error.message);
       }
     },
   });
 
   // Join a public community
   const joinCommunity = useMutation({
     mutationFn: async (communityId: string) => {
       if (!profile) throw new Error("Not authenticated");
 
       const { error } = await supabase.from("community_members").insert({
         community_id: communityId,
         user_id: profile.id,
         role: "member",
       });
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["my-communities"] });
       queryClient.invalidateQueries({ queryKey: ["public-communities"] });
       toast.success("Vous avez rejoint la communauté !");
     },
     onError: (error) => {
       toast.error("Erreur: " + error.message);
     },
    });
  
    // Leave a community
    const leaveCommunity = useMutation({
      mutationFn: async (communityId: string) => {
        if (!profile) throw new Error("Not authenticated");

        const { error } = await supabase
          .from("community_members")
          .delete()
          .eq("community_id", communityId)
          .eq("user_id", profile.id);

        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["my-communities"] });
        toast.success("Vous avez quitté la communauté");
      },
    });

    // Join by invite code
    const joinByCode = useMutation({
      mutationFn: async (code: string) => {
        const { data, error } = await supabase.rpc("join_community_by_code", { _code: code });
        if (error) throw error;
        return data as { success: boolean; error?: string; community_name?: string; is_approved?: boolean };
      },
      onSuccess: (data) => {
        if (data?.success) {
          queryClient.invalidateQueries({ queryKey: ["my-communities"] });
          queryClient.invalidateQueries({ queryKey: ["public-communities"] });
          toast.success(data.is_approved 
            ? `Bienvenue dans ${data.community_name} !` 
            : `Demande envoyée pour ${data.community_name}`
          );
        } else {
          toast.error(data?.error || "Code invalide");
        }
      },
      onError: (error) => {
        toast.error("Erreur: " + error.message);
      },
    });

    return {
      myCommunities: myCommunitiesQuery.data ?? [],
      publicCommunities: publicCommunitiesQuery.data ?? [],
      isLoading: myCommunitiesQuery.isLoading,
      isLoadingPublic: publicCommunitiesQuery.isLoading,
      createCommunity,
      joinCommunity,
      leaveCommunity,
      joinByCode,
    };
  }
 
 export function useCommunity(slug: string) {
   return useQuery({
     queryKey: ["community", slug],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("communities")
         .select("*")
         .eq("slug", slug)
         .single();
 
       if (error) throw error;
       return data as Community;
     },
     enabled: !!slug,
   });
 }