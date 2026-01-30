import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useCommentLikes(commentId: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const likeQuery = useQuery({
    queryKey: ["comment-like", commentId, profile?.id],
    queryFn: async () => {
      if (!profile) return false;

      const { data, error } = await supabase
        .from("comment_likes")
        .select("id")
        .eq("comment_id", commentId)
        .eq("user_id", profile.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!profile,
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error("Not authenticated");

      if (likeQuery.data) {
        // Unlike
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", profile.id);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase.from("comment_likes").insert({
          comment_id: commentId,
          user_id: profile.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comment-like", commentId] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  return {
    isLiked: likeQuery.data ?? false,
    toggleLike,
  };
}
