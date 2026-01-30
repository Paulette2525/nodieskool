import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "./useDebounce";

interface SearchResult {
  type: "post" | "course" | "member";
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];

      const searchTerm = `%${debouncedQuery}%`;

      // Search in parallel
      const [postsRes, coursesRes, membersRes] = await Promise.all([
        supabase
          .from("posts")
          .select("id, content, profiles!inner(username, full_name)")
          .ilike("content", searchTerm)
          .limit(5),
        supabase
          .from("courses")
          .select("id, title, description")
          .eq("is_published", true)
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(5),
        supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .or(`username.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
          .limit(5),
      ]);

      const results: SearchResult[] = [];

      // Add posts
      if (postsRes.data) {
        postsRes.data.forEach((post: any) => {
          results.push({
            type: "post",
            id: post.id,
            title: post.content.substring(0, 50) + (post.content.length > 50 ? "..." : ""),
            subtitle: `@${post.profiles.username}`,
          });
        });
      }

      // Add courses
      if (coursesRes.data) {
        coursesRes.data.forEach((course) => {
          results.push({
            type: "course",
            id: course.id,
            title: course.title,
            subtitle: course.description?.substring(0, 50),
          });
        });
      }

      // Add members
      if (membersRes.data) {
        membersRes.data.forEach((member) => {
          results.push({
            type: "member",
            id: member.id,
            title: member.full_name || member.username,
            subtitle: `@${member.username}`,
            avatar: member.avatar_url || undefined,
          });
        });
      }

      return results;
    },
    enabled: debouncedQuery.length >= 2,
  });

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    clearSearch,
  };
}
