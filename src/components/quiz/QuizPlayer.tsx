import { useState } from "react";
import { useQuizzes } from "@/hooks/useQuizzes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Loader2, Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizPlayerProps {
  moduleId: string;
  onComplete?: () => void;
}

export function QuizPlayer({ moduleId, onComplete }: QuizPlayerProps) {
  const { quizzes, submitQuiz, hasPassedQuiz, isLoading } = useQuizzes(moduleId);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<{
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (quizzes.length === 0) {
    return null;
  }

  const currentQuiz = quizzes[currentQuizIndex];
  const questions = currentQuiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const result = await submitQuiz.mutateAsync({
      quizId: currentQuiz.id,
      answers,
    });

    setLastAttempt({
      score: result.score,
      maxScore: result.max_score,
      percentage: result.percentage,
      passed: result.passed,
    });
    setShowResults(true);

    if (result.passed && onComplete) {
      onComplete();
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setLastAttempt(null);
  };

  // Already passed
  if (hasPassedQuiz(currentQuiz.id) && !showResults) {
    return (
      <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
            <CheckCircle className="h-6 w-6" />
            <div>
              <p className="font-medium">Quiz réussi !</p>
              <p className="text-sm opacity-80">Vous avez déjà validé ce quiz.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show results
  if (showResults && lastAttempt) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {lastAttempt.passed ? (
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-green-600" />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className={lastAttempt.passed ? "text-green-600" : "text-red-600"}>
            {lastAttempt.passed ? "Félicitations !" : "Dommage !"}
          </CardTitle>
          <CardDescription>
            Score: {lastAttempt.score}/{lastAttempt.maxScore} ({lastAttempt.percentage}%)
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {lastAttempt.passed
              ? "Vous avez réussi le quiz et gagné des points !"
              : `Score minimum requis: ${currentQuiz.passing_score}%`}
          </p>
          {!lastAttempt.passed && (
            <Button onClick={handleRetry} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Réessayer
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Quiz questions
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg">{currentQuiz.title}</CardTitle>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1}/{totalQuestions}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {currentQuestion && (
          <>
            <p className="text-lg font-medium">{currentQuestion.question}</p>

            <RadioGroup
              value={answers[currentQuestion.id]?.toString()}
              onValueChange={(value) =>
                handleAnswerSelect(currentQuestion.id, parseInt(value))
              }
              className="space-y-3"
            >
              {(currentQuestion.options as any[]).map((option, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors",
                    answers[currentQuestion.id] === index
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  )}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Précédent
              </Button>
              <Button
                onClick={handleNext}
                disabled={answers[currentQuestion.id] === undefined || submitQuiz.isPending}
              >
                {submitQuiz.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentQuestionIndex === totalQuestions - 1 ? "Terminer" : "Suivant"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
