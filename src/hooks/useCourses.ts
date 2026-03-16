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
   return useCoursesWithCommunity();
 }
 
 export function useCoursesWithCommunity(communityId?: string | null) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const coursesQuery = useQuery({
     queryKey: ["courses", communityId ?? "global"],
    queryFn: async () => {
       let query = supabase.from("courses")
        .select(`
          *,
          modules (
            *,
            lessons (*)
          )
        `)
        .order("order_index");
       
       if (communityId) {
         query = query.eq("community_id", communityId);
       }
       
       const { data, error } = await query;
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

  const createModule = useMutation({
    mutationFn: async (data: { course_id: string; title: string; description?: string; order_index?: number }) => {
      const { error } = await supabase.from("modules").insert({
        course_id: data.course_id,
        title: data.title,
        description: data.description || null,
        order_index: data.order_index ?? 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Module créé !");
    },
    onError: (error) => toast.error("Erreur : " + error.message),
  });

  const updateModule = useMutation({
    mutationFn: async (data: { id: string; title: string; description?: string; order_index?: number; is_locked?: boolean }) => {
      const { error } = await supabase.from("modules").update({
        title: data.title,
        description: data.description || null,
        order_index: data.order_index,
        is_locked: data.is_locked,
      }).eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Module mis à jour !");
    },
    onError: (error) => toast.error("Erreur : " + error.message),
  });

  const deleteModule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("modules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Module supprimé !");
    },
    onError: (error) => toast.error("Erreur : " + error.message),
  });

  const createLesson = useMutation({
    mutationFn: async (data: { module_id: string; title: string; content?: string; video_url?: string; duration_minutes?: number; points_reward?: number; order_index?: number }) => {
      const { error } = await supabase.from("lessons").insert({
        module_id: data.module_id,
        title: data.title,
        content: data.content || null,
        video_url: data.video_url || null,
        duration_minutes: data.duration_minutes || null,
        points_reward: data.points_reward ?? 10,
        order_index: data.order_index ?? 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Leçon créée !");
    },
    onError: (error) => toast.error("Erreur : " + error.message),
  });

  const updateLesson = useMutation({
    mutationFn: async (data: { id: string; title: string; content?: string; video_url?: string; duration_minutes?: number; points_reward?: number; order_index?: number }) => {
      const { error } = await supabase.from("lessons").update({
        title: data.title,
        content: data.content || null,
        video_url: data.video_url || null,
        duration_minutes: data.duration_minutes || null,
        points_reward: data.points_reward,
        order_index: data.order_index,
      }).eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Leçon mise à jour !");
    },
    onError: (error) => toast.error("Erreur : " + error.message),
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Leçon supprimée !");
    },
    onError: (error) => toast.error("Erreur : " + error.message),
  });

  return {
    courses: coursesQuery.data ?? [],
    completedLessons: progressQuery.data ?? [],
    isLoading: coursesQuery.isLoading,
    completeLesson,
    createCourse,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson,
  };
}
