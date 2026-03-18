import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    level: number;
    points: number;
  };
}

export function usePosts() {
  return usePostsWithCommunity();
}

export function usePostsWithCommunity(communityId?: string | null) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const postsQuery = useInfiniteQuery({
    queryKey: ["posts", communityId ?? "global"],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase.from("posts")
        .select(`
          *,
          profiles (
            id,
            username,
            full_name,
            avatar_url,
            level,
            points
          )
        `)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);
      
      if (communityId) {
        query = query.eq("community_id", communityId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Post[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.flat().length;
    },
    initialPageParam: 0,
  });

  // Batch fetch likes & bookmarks for all loaded posts
  const allPosts = postsQuery.data?.pages.flat() ?? [];
  const postIds = allPosts.map(p => p.id);

  const userLikesQuery = useQuery({
    queryKey: ["user-likes-batch", communityId ?? "global", postIds.join(",")],
    queryFn: async () => {
      if (!profile || postIds.length === 0) return new Set<string>();
      const { data, error } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", profile.id)
        .in("post_id", postIds);
      if (error) throw error;
      return new Set(data.map(d => d.post_id));
    },
    enabled: !!profile && postIds.length > 0,
  });

  const userBookmarksQuery = useQuery({
    queryKey: ["user-bookmarks-batch", communityId ?? "global", postIds.join(",")],
    queryFn: async () => {
      if (!profile || postIds.length === 0) return new Set<string>();
      const { data, error } = await supabase
        .from("post_bookmarks")
        .select("post_id")
        .eq("user_id", profile.id)
        .in("post_id", postIds);
      if (error) throw error;
      return new Set(data.map(d => d.post_id));
    },
    enabled: !!profile && postIds.length > 0,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["posts", communityId ?? "global"] });
    queryClient.invalidateQueries({ queryKey: ["user-likes-batch"] });
    queryClient.invalidateQueries({ queryKey: ["user-bookmarks-batch"] });
  };

  const createPost = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl?: string }) => {
      if (!profile) throw new Error("Not authenticated");
      const { error } = await supabase.from("posts").insert({
        user_id: profile.id,
        content,
        image_url: imageUrl,
        community_id: communityId ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); toast.success("Post créé !"); },
    onError: (error) => { toast.error("Erreur : " + error.message); },
  });

  const updatePost = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { error } = await supabase.from("posts").update({ content }).eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); toast.success("Post modifié !"); },
    onError: (error) => { toast.error("Erreur : " + error.message); },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); toast.success("Post supprimé !"); },
    onError: (error) => { toast.error("Erreur : " + error.message); },
  });

  const togglePin = useMutation({
    mutationFn: async ({ postId, isPinned }: { postId: string; isPinned: boolean }) => {
      const { error } = await supabase.from("posts").update({ is_pinned: !isPinned }).eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => { invalidateAll(); },
  });

  const toggleLike = useMutation({
    mutationFn: async (postId: string) => {
      if (!profile) throw new Error("Not authenticated");
      const isLiked = userLikesQuery.data?.has(postId);
      if (isLiked) {
        const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("post_likes").insert({ post_id: postId, user_id: profile.id });
        if (error) throw error;
      }
    },
    onSuccess: () => { invalidateAll(); },
  });

  const toggleBookmark = useMutation({
    mutationFn: async (postId: string) => {
      if (!profile) throw new Error("Not authenticated");
      const isBookmarked = userBookmarksQuery.data?.has(postId);
      if (isBookmarked) {
        const { error } = await supabase.from("post_bookmarks").delete().eq("post_id", postId).eq("user_id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("post_bookmarks").insert({ post_id: postId, user_id: profile.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidateAll();
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  return {
    posts: allPosts,
    isLoading: postsQuery.isLoading,
    hasNextPage: postsQuery.hasNextPage,
    fetchNextPage: postsQuery.fetchNextPage,
    isFetchingNextPage: postsQuery.isFetchingNextPage,
    likedPostIds: userLikesQuery.data ?? new Set<string>(),
    bookmarkedPostIds: userBookmarksQuery.data ?? new Set<string>(),
    createPost,
    updatePost,
    deletePost,
    togglePin,
    toggleLike,
    toggleBookmark,
  };
}

// Keep for backward compat but should migrate to batch approach
export function usePostLikes(postId: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const likeQuery = useQuery({
    queryKey: ["post-like", postId, profile?.id],
    queryFn: async () => {
      if (!profile) return false;
      const { data, error } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
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
        const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("post_likes").insert({ post_id: postId, user_id: profile.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-like", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return { isLiked: likeQuery.data ?? false, toggleLike };
}
