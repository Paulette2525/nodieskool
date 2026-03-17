import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface QuizOption {
  text: string;
  isCorrect?: boolean; // Only available for admins
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

  // Fetch quizzes for a module - using the public view that hides correct answers
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["quizzes", moduleId],
    queryFn: async () => {
      if (!moduleId) return [];

      // Get quizzes
      const { data: quizzesData, error: quizzesError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("module_id", moduleId)
        .order("created_at", { ascending: true });

      if (quizzesError) throw quizzesError;

      // Get questions from the public view (without correct answers)
      const quizIds = quizzesData.map(q => q.id);
      
      if (quizIds.length === 0) return quizzesData as Quiz[];

      // Use the public view that strips isCorrect from options
      // The view is created in the database but not in types, so we use raw query
      const { data: questionsData, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("id, quiz_id, question, order_index, points, options")
        .in("quiz_id", quizIds);

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        return quizzesData as Quiz[];
      }
      
      // Process questions and strip isCorrect from options for client-side safety
      return quizzesData.map((quiz) => ({
        ...quiz,
        questions: (questionsData || [])
          .filter((q) => q.quiz_id === quiz.id)
          .map((q) => ({
            ...q,
            // Strip isCorrect from options - grading happens server-side
            options: Array.isArray(q.options) 
              ? (q.options as any[]).map((opt: any) => ({ text: opt.text }))
              : []
          }))
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
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

  // Submit a quiz attempt - uses server-side grading
  const submitQuiz = useMutation({
    mutationFn: async ({
      quizId,
      answers,
    }: {
      quizId: string;
      answers: Record<string, number>;
    }) => {
      if (!profile) throw new Error("Must be logged in");

      // Calculate score using server-side grading function
      let score = 0;
      let maxScore = 0;

      // Get quiz info and question points
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select("*, questions:quiz_questions(id, points)")
        .eq("id", quizId)
        .single();

      if (quizError) throw quizError;

      // Grade each answer using the secure server-side function
      for (const question of quiz.questions || []) {
        maxScore += question.points || 10;
        const selectedIndex = answers[question.id];
        
        if (selectedIndex !== undefined) {
          // Use server-side grading - correct answers never exposed to client
          const { data: isCorrect, error: gradeError } = await supabase
            .rpc("grade_quiz_answer", {
              _question_id: question.id,
              _selected_index: selectedIndex,
            });

          if (gradeError) {
            console.error("Grading error:", gradeError);
          } else if (isCorrect) {
            score += question.points || 10;
          }
        }
      }

      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const passed = percentage >= (quiz.passing_score || 70);

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
