import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useBookmarks() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const bookmarksQuery = useQuery({
    queryKey: ["bookmarks", profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data, error } = await supabase
        .from("post_bookmarks")
        .select("post_id")
        .eq("user_id", profile.id);

      if (error) throw error;
      return data.map((b) => b.post_id);
    },
    enabled: !!profile,
  });

  return {
    bookmarkedPostIds: bookmarksQuery.data ?? [],
    isLoading: bookmarksQuery.isLoading,
  };
}

export function usePostBookmark(postId: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const bookmarkQuery = useQuery({
    queryKey: ["bookmark", postId, profile?.id],
    queryFn: async () => {
      if (!profile) return false;

      const { data, error } = await supabase
        .from("post_bookmarks")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", profile.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!profile,
  });

  const toggleBookmark = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error("Not authenticated");

      if (bookmarkQuery.data) {
        // Remove bookmark
        const { error } = await supabase
          .from("post_bookmarks")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", profile.id);
        if (error) throw error;
      } else {
        // Add bookmark
        const { error } = await supabase.from("post_bookmarks").insert({
          post_id: postId,
          user_id: profile.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      const wasBookmarked = bookmarkQuery.data;
      queryClient.invalidateQueries({ queryKey: ["bookmark", postId] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success(wasBookmarked ? "Retiré des favoris" : "Ajouté aux favoris");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  return {
    isBookmarked: bookmarkQuery.data ?? false,
    toggleBookmark,
  };
}
