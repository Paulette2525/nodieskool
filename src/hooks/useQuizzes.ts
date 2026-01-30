import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: QuizOption[];
  order_index: number;
  points: number;
}

interface Quiz {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  time_limit_minutes: number | null;
  questions?: QuizQuestion[];
}

interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, number>;
  started_at: string;
  completed_at: string;
}

export function useQuizzes(moduleId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch quizzes for a module
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["quizzes", moduleId],
    queryFn: async () => {
      if (!moduleId) return [];

      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          *,
          questions:quiz_questions(*)
        `)
        .eq("module_id", moduleId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      return data.map((quiz: any) => ({
        ...quiz,
        questions: quiz.questions?.sort((a: QuizQuestion, b: QuizQuestion) => 
          a.order_index - b.order_index
        ),
      })) as Quiz[];
    },
    enabled: !!moduleId,
  });

  // Fetch user's quiz attempts
  const { data: attempts = [] } = useQuery({
    queryKey: ["quiz-attempts", profile?.id, moduleId],
    queryFn: async () => {
      if (!profile || !moduleId) return [];

      // Get quiz IDs for this module
      const { data: moduleQuizzes } = await supabase
        .from("quizzes")
        .select("id")
        .eq("module_id", moduleId);

      if (!moduleQuizzes || moduleQuizzes.length === 0) return [];

      const quizIds = moduleQuizzes.map((q) => q.id);

      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", profile.id)
        .in("quiz_id", quizIds)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return data as QuizAttempt[];
    },
    enabled: !!profile && !!moduleId,
  });

  // Submit a quiz attempt
  const submitQuiz = useMutation({
    mutationFn: async ({
      quizId,
      answers,
    }: {
      quizId: string;
      answers: Record<string, number>;
    }) => {
      if (!profile) throw new Error("Must be logged in");

      // Fetch quiz with questions to calculate score
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select(`
          *,
          questions:quiz_questions(*)
        `)
        .eq("id", quizId)
        .single();

      if (quizError) throw quizError;

      // Calculate score
      let score = 0;
      let maxScore = 0;

      quiz.questions?.forEach((q: any) => {
        maxScore += q.points;
        const selectedIndex = answers[q.id];
        if (selectedIndex !== undefined) {
          const options = q.options as QuizOption[];
          if (options[selectedIndex]?.isCorrect) {
            score += q.points;
          }
        }
      });

      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const passed = percentage >= quiz.passing_score;

      // Save attempt
      const { data: attempt, error: attemptError } = await supabase
        .from("quiz_attempts")
        .insert({
          user_id: profile.id,
          quiz_id: quizId,
          score,
          max_score: maxScore,
          percentage,
          passed,
          answers,
        })
        .select()
        .single();

      if (attemptError) throw attemptError;

      // Award points if passed
      if (passed) {
        await supabase.rpc("update_user_points", {
          _user_id: profile.id,
          _points: Math.round(score / 2),
          _reason: `Quiz réussi: ${quiz.title}`,
        });
      }

      return attempt as QuizAttempt;
    },
    onSuccess: (attempt) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
      if (attempt.passed) {
        toast.success(`Bravo ! Vous avez réussi le quiz avec ${attempt.percentage}% !`);
      } else {
        toast.error(`Score insuffisant (${attempt.percentage}%). Réessayez !`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const getQuizAttempt = (quizId: string) => {
    return attempts.find((a) => a.quiz_id === quizId && a.passed);
  };

  const hasPassedQuiz = (quizId: string) => {
    return attempts.some((a) => a.quiz_id === quizId && a.passed);
  };

  return {
    quizzes,
    attempts,
    isLoading,
    submitQuiz,
    getQuizAttempt,
    hasPassedQuiz,
  };
}
