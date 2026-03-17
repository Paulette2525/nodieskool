import { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, PlayCircle, CheckCircle, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCourses, Module, Lesson } from "@/hooks/useCourses";
import { cn } from "@/lib/utils";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { courses, completedLessons, isLoading, completeLesson } = useCourses();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const course = courses.find((c) => c.id === id);
  if (isLoading) return <MainLayout><div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></MainLayout>;
  if (!course) return <MainLayout><div className="flex flex-col items-center justify-center min-h-[50vh] p-6"><h2 className="text-lg font-semibold">Cours non trouvé</h2><Button onClick={() => navigate("/classroom")} className="mt-3 rounded-xl text-xs">Retour</Button></div></MainLayout>;

  const courseLessons = course.modules.flatMap((m) => m.lessons);
  const courseCompleted = courseLessons.filter((l) => completedLessons.includes(l.id)).length;
  const courseProgress = courseLessons.length > 0 ? Math.round((courseCompleted / courseLessons.length) * 100) : 0;

  const handleLessonClick = (lesson: Lesson, module: Module) => { if (!module.is_locked) setSelectedLesson(lesson); };
  const handleCompleteLesson = () => { if (selectedLesson && !completedLessons.includes(selectedLesson.id)) completeLesson.mutate(selectedLesson.id); };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate("/classroom")} className="mb-4 gap-1.5 -ml-2 text-xs rounded-xl">
          <ArrowLeft className="h-3.5 w-3.5" /><span className="hidden sm:inline">Retour aux formations</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {selectedLesson ? (
              <Card className="overflow-hidden rounded-2xl border-border/50">
                {selectedLesson.video_url ? (
                  <div className="aspect-video"><iframe src={getYouTubeEmbedUrl(selectedLesson.video_url)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center"><PlayCircle className="h-12 w-12 text-muted-foreground/30" /></div>
                )}
                <div className="p-5">
                  <h2 className="text-base font-semibold">{selectedLesson.title}</h2>
                  {selectedLesson.content && <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{selectedLesson.content}</p>}
                  <Button onClick={handleCompleteLesson} disabled={completedLessons.includes(selectedLesson.id) || completeLesson.isPending} className="mt-4 gap-1.5 rounded-xl text-xs h-9">
                    {completedLessons.includes(selectedLesson.id) ? <><CheckCircle className="h-3.5 w-3.5" />Terminée</> : completeLesson.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />En cours...</> : <><CheckCircle className="h-3.5 w-3.5" />Marquer comme terminée</>}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="overflow-hidden rounded-2xl border-border/50">
                {course.thumbnail_url ? <img src={course.thumbnail_url} alt={course.title} className="w-full aspect-video object-cover" /> : <div className="aspect-video bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center"><PlayCircle className="h-12 w-12 text-primary/30" /></div>}
                <div className="p-5">
                  <h1 className="text-lg font-bold">{course.title}</h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">{course.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">Sélectionnez une leçon pour commencer</p>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-4 rounded-2xl border-border/50 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">Progression</span>
                <span className="text-xs font-semibold text-primary">{courseProgress}%</span>
              </div>
              <Progress value={courseProgress} className="h-1.5" />
              <p className="mt-1.5 text-[10px] text-muted-foreground">{courseCompleted} / {courseLessons.length} leçons</p>
            </Card>

            <Card className="p-4 rounded-2xl border-border/50 shadow-card">
              <h3 className="text-xs font-semibold mb-2">Contenu du cours</h3>
              <Accordion type="multiple" defaultValue={course.modules.map((m) => m.id)}>
                {course.modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id}>
                    <AccordionTrigger className="text-xs hover:no-underline py-2">
                      <div className="flex items-center gap-2 text-left">
                        {module.is_locked ? <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" /> : <PlayCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                        <span className="line-clamp-1">{module.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-0.5 pl-5">
                        {module.lessons.map((lesson) => {
                          const isCompleted = completedLessons.includes(lesson.id);
                          const isActive = selectedLesson?.id === lesson.id;
                          return (
                            <button key={lesson.id} onClick={() => handleLessonClick(lesson, module)} disabled={module.is_locked} className={cn(
                              "w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center gap-2",
                              isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                              module.is_locked && "opacity-50 cursor-not-allowed"
                            )}>
                              {isCompleted ? <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" /> : module.is_locked ? <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" /> : <PlayCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                              <span className="line-clamp-1 flex-1">{lesson.title}</span>
                              {lesson.duration_minutes && <span className="text-[10px] text-muted-foreground flex-shrink-0">{lesson.duration_minutes}m</span>}
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
