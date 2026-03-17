import { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle,
  Lock,
  Clock,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCourses, Module, Lesson } from "@/hooks/useCourses";
import { cn } from "@/lib/utils";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { courses, completedLessons, isLoading, completeLesson } = useCourses();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const course = courses.find((c) => c.id === id);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
          <h2 className="text-xl font-semibold text-foreground">Cours non trouvé</h2>
          <Button onClick={() => navigate("/classroom")} className="mt-4">
            Retour aux cours
          </Button>
        </div>
      </MainLayout>
    );
  }

  const courseLessons = course.modules.flatMap((m) => m.lessons);
  const courseCompleted = courseLessons.filter((l) =>
    completedLessons.includes(l.id)
  ).length;
  const courseProgress =
    courseLessons.length > 0
      ? Math.round((courseCompleted / courseLessons.length) * 100)
      : 0;

  const handleLessonClick = (lesson: Lesson, module: Module) => {
    if (module.is_locked) return;
    setSelectedLesson(lesson);
  };

  const handleCompleteLesson = () => {
    if (selectedLesson && !completedLessons.includes(selectedLesson.id)) {
      completeLesson.mutate(selectedLesson.id);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/classroom")}
          className="mb-4 gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Retour aux cours</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player or Course Header */}
            {selectedLesson ? (
              <Card className="overflow-hidden">
                {selectedLesson.video_url ? (
                  <div className="aspect-video">
                    <iframe
                      src={getYouTubeEmbedUrl(selectedLesson.video_url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <PlayCircle className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-semibold">{selectedLesson.title}</h2>
                  {selectedLesson.content && (
                    <p className="mt-3 text-muted-foreground text-sm md:text-base whitespace-pre-wrap">
                      {selectedLesson.content}
                    </p>
                  )}
                  <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button
                      onClick={handleCompleteLesson}
                      disabled={
                        completedLessons.includes(selectedLesson.id) ||
                        completeLesson.isPending
                      }
                      className="gap-2"
                    >
                      {completedLessons.includes(selectedLesson.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Leçon terminée
                        </>
                      ) : completeLesson.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          En cours...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Marquer comme terminée
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <PlayCircle className="h-16 w-16 text-primary/40" />
                  </div>
                )}
                <div className="p-4 md:p-6">
                  <h1 className="text-xl md:text-2xl font-bold">{course.title}</h1>
                  <p className="mt-2 text-muted-foreground text-sm md:text-base">{course.description}</p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Sélectionnez une leçon pour commencer
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar - Modules & Lessons */}
          <div className="space-y-4">
            {/* Progress */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progression</span>
                <span className="text-sm font-medium text-primary">
                  {courseProgress}%
                </span>
              </div>
              <Progress value={courseProgress} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                {courseCompleted} / {courseLessons.length} leçons terminées
              </p>
            </Card>

            {/* Modules */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Contenu du cours</h3>
              <Accordion type="multiple" defaultValue={course.modules.map((m) => m.id)}>
                {course.modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id}>
                    <AccordionTrigger className="text-sm hover:no-underline">
                      <div className="flex items-center gap-2 text-left">
                        {module.is_locked ? (
                          <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <PlayCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                        <span className="line-clamp-1">{module.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-6">
                        {module.lessons.map((lesson) => {
                          const isCompleted = completedLessons.includes(lesson.id);
                          const isActive = selectedLesson?.id === lesson.id;

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson, module)}
                              disabled={module.is_locked}
                              className={cn(
                                "w-full text-left p-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-muted",
                                module.is_locked && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                              ) : module.is_locked ? (
                                <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <PlayCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              )}
                              <span className="line-clamp-1 flex-1">{lesson.title}</span>
                              {lesson.duration_minutes && (
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {lesson.duration_minutes}m
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
