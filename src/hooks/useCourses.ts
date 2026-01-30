import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  order_index: number;
  created_at: string;
  modules: Module[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  is_locked: boolean;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  points_reward: number;
}

export function useCourses() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const coursesQuery = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          modules (
            *,
            lessons (*)
          )
        `)
        .order("order_index");

      if (error) throw error;
      return data as Course[];
    },
  });

  const progressQuery = useQuery({
    queryKey: ["lesson-progress", profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", profile.id);

      if (error) throw error;
      return data.map((p) => p.lesson_id);
    },
    enabled: !!profile,
  });

  const completeLesson = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!profile) throw new Error("Not authenticated");

      const { error } = await supabase.from("lesson_progress").insert({
        user_id: profile.id,
        lesson_id: lessonId,
      });

      if (error && !error.message.includes("duplicate")) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Lesson completed! +10 points");
    },
    onError: (error) => {
      toast.error("Failed to complete lesson: " + error.message);
    },
  });

  const createCourse = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      if (!profile) throw new Error("Not authenticated");

      const { error } = await supabase.from("courses").insert({
        title: data.title,
        description: data.description,
        created_by: profile.id,
        is_published: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course created!");
    },
    onError: (error) => {
      toast.error("Failed to create course: " + error.message);
    },
  });

  return {
    courses: coursesQuery.data ?? [],
    completedLessons: progressQuery.data ?? [],
    isLoading: coursesQuery.isLoading,
    completeLesson,
    createCourse,
  };
}
