import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useCoursesWithCommunity, Module, Lesson } from "@/hooks/useCourses";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Loader2,
  Plus,
  Edit,
  Trash2,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

function ModuleForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: { title: string; description: string; order_index: number; is_locked: boolean }) => void;
  initialData?: { title: string; description: string; order_index: number; is_locked: boolean };
  isPending: boolean;
}) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [isLocked, setIsLocked] = useState(initialData?.is_locked ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, order_index: initialData?.order_index ?? 0, is_locked: isLocked });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Modifier le module" : "Nouveau module"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Introduction" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description du module..." rows={2} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Verrouillé</Label>
            <Switch checked={isLocked} onCheckedChange={setIsLocked} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending || !title}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Mettre à jour" : "Créer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LessonForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: { title: string; content: string; video_url: string; duration_minutes: number; points_reward: number; order_index: number }) => void;
  initialData?: { title: string; content: string; video_url: string; order_index: number };
  isPending: boolean;
}) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, video_url: videoUrl, duration_minutes: 0, points_reward: 10, order_index: initialData?.order_index ?? 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Modifier la leçon" : "Nouvelle leçon"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Les bases du marketing" />
          </div>
          <div className="space-y-2">
            <Label>Contenu</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenu de la leçon..." rows={4} />
          </div>
          <div className="space-y-2">
            <Label>URL vidéo (YouTube, etc.)</Label>
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <Button type="submit" className="w-full" disabled={isPending || !title}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Mettre à jour" : "Créer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CommunityClassroomDetailContent() {
  const { id } = useParams<{ id: string; slug: string }>();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { community, isAdmin } = useCommunityContext();
  const {
    courses, completedLessons, isLoading, completeLesson,
    createModule, updateModule, deleteModule,
    createLesson, updateLesson, deleteLesson,
  } = useCoursesWithCommunity(community?.id);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [moduleFormOpen, setModuleFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const [lessonFormOpen, setLessonFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);

  const course = courses.find((c) => c.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <h2 className="text-xl font-semibold text-foreground">Cours non trouvé</h2>
        <Button onClick={() => navigate(`/c/${slug}/classroom`)} className="mt-4">
          Retour aux cours
        </Button>
      </div>
    );
  }

  const sortedModules = [...(course.modules || [])].sort((a, b) => a.order_index - b.order_index);
  const courseLessons = sortedModules.flatMap((m) => m.lessons || []);
  const courseCompleted = courseLessons.filter((l) => completedLessons.includes(l.id)).length;
  const courseProgress = courseLessons.length > 0 ? Math.round((courseCompleted / courseLessons.length) * 100) : 0;

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  const handleLessonClick = (lesson: Lesson, module: Module) => {
    if (module.is_locked) return;
    setSelectedLesson(lesson);
  };

  const handleCompleteLesson = () => {
    if (selectedLesson && !completedLessons.includes(selectedLesson.id)) {
      completeLesson.mutate(selectedLesson.id);
    }
  };

  const handleCreateModule = () => {
    setEditingModule(null);
    setModuleFormOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setModuleFormOpen(true);
  };

  const handleModuleSubmit = (data: { title: string; description: string; order_index: number; is_locked: boolean }) => {
    if (editingModule) {
      updateModule.mutate({ id: editingModule.id, ...data }, { onSuccess: () => setModuleFormOpen(false) });
    } else {
      const autoOrder = sortedModules.length > 0 ? Math.max(...sortedModules.map(m => m.order_index)) + 1 : 0;
      createModule.mutate({ course_id: course.id, ...data, order_index: autoOrder }, { onSuccess: () => setModuleFormOpen(false) });
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    if (confirm("Supprimer ce module et toutes ses leçons ?")) {
      deleteModule.mutate(moduleId);
    }
  };

  const handleCreateLesson = (moduleId: string) => {
    setEditingLesson(null);
    setTargetModuleId(moduleId);
    setLessonFormOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setTargetModuleId(lesson.module_id);
    setLessonFormOpen(true);
  };

  const handleLessonSubmit = (data: { title: string; content: string; video_url: string; duration_minutes: number; points_reward: number; order_index: number }) => {
    if (editingLesson) {
      updateLesson.mutate({ id: editingLesson.id, ...data }, { onSuccess: () => setLessonFormOpen(false) });
    } else if (targetModuleId) {
      const mod = sortedModules.find(m => m.id === targetModuleId);
      const lessons = mod?.lessons || [];
      const autoOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order_index)) + 1 : 0;
      createLesson.mutate({ module_id: targetModuleId, ...data, order_index: autoOrder }, { onSuccess: () => setLessonFormOpen(false) });
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (confirm("Supprimer cette leçon ?")) {
      deleteLesson.mutate(lessonId);
      if (selectedLesson?.id === lessonId) setSelectedLesson(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <Button variant="ghost" onClick={() => navigate(`/c/${slug}/classroom`)} className="mb-4 gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Retour aux cours</span>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
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
                <div className="mt-4">
                  <Button
                    onClick={handleCompleteLesson}
                    disabled={completedLessons.includes(selectedLesson.id) || completeLesson.isPending}
                    className="gap-2"
                  >
                    {completedLessons.includes(selectedLesson.id) ? (
                      <><CheckCircle className="h-4 w-4" />Leçon terminée</>
                    ) : completeLesson.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />En cours...</>
                    ) : (
                      <><CheckCircle className="h-4 w-4" />Marquer comme terminée</>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full aspect-video object-cover" />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <PlayCircle className="h-16 w-16 text-primary/40" />
                </div>
              )}
              <div className="p-4 md:p-6">
                <h1 className="text-xl md:text-2xl font-bold">{course.title}</h1>
                <p className="mt-2 text-muted-foreground text-sm md:text-base">{course.description}</p>
                <p className="mt-4 text-sm text-muted-foreground">Sélectionnez une leçon pour commencer</p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progression</span>
              <span className="text-sm font-medium text-primary">{courseProgress}%</span>
            </div>
            <Progress value={courseProgress} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {courseCompleted} / {courseLessons.length} leçons terminées
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Contenu du cours</h3>
              {isAdmin && (
                <Button size="sm" variant="outline" onClick={handleCreateModule} className="gap-1 h-8">
                  <Plus className="h-3 w-3" />
                  Module
                </Button>
              )}
            </div>

            {sortedModules.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun module</p>
              </div>
            ) : (
              <Accordion type="multiple" defaultValue={sortedModules.map((m) => m.id)}>
                {sortedModules.map((module) => {
                  const sortedLessons = [...(module.lessons || [])].sort((a, b) => a.order_index - b.order_index);
                  return (
                    <AccordionItem key={module.id} value={module.id}>
                      <AccordionTrigger className="text-sm hover:no-underline">
                        <div className="flex items-center gap-2 text-left flex-1">
                          {module.is_locked ? (
                            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <PlayCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                          <span className="line-clamp-1 flex-1">{module.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {isAdmin && (
                          <div className="space-y-1 mb-2 pl-6">
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => handleEditModule(module)}>
                                <Edit className="h-3 w-3" />Modifier
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => handleDeleteModule(module.id)}>
                                <Trash2 className="h-3 w-3" />Supprimer
                              </Button>
                            </div>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 w-full" onClick={() => handleCreateLesson(module.id)}>
                              <Plus className="h-3 w-3" />Ajouter une leçon
                            </Button>
                          </div>
                        )}
                        <div className="space-y-1 pl-6">
                          {sortedLessons.map((lesson) => {
                            const isCompleted = completedLessons.includes(lesson.id);
                            const isActive = selectedLesson?.id === lesson.id;
                            return (
                              <div key={lesson.id} className="flex items-center gap-1 group/lesson">
                                <button
                                  onClick={() => handleLessonClick(lesson, module)}
                                  disabled={module.is_locked}
                                  className={cn(
                                    "flex-1 text-left p-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                                    isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
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
                                </button>
                                {isAdmin && (
                                  <div className="flex shrink-0">
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditLesson(lesson)}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteLesson(lesson.id)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </Card>
        </div>
      </div>

      <ModuleForm
        open={moduleFormOpen}
        onOpenChange={setModuleFormOpen}
        onSubmit={handleModuleSubmit}
        initialData={editingModule ? {
          title: editingModule.title,
          description: editingModule.description || "",
          order_index: editingModule.order_index,
          is_locked: editingModule.is_locked,
        } : undefined}
        isPending={createModule.isPending || updateModule.isPending}
      />

      <LessonForm
        open={lessonFormOpen}
        onOpenChange={setLessonFormOpen}
        onSubmit={handleLessonSubmit}
        initialData={editingLesson ? {
          title: editingLesson.title,
          content: editingLesson.content || "",
          video_url: editingLesson.video_url || "",
          order_index: editingLesson.order_index,
        } : undefined}
        isPending={createLesson.isPending || updateLesson.isPending}
      />
    </div>
  );
}

export default function CommunityClassroomDetail() {
  return <CommunityClassroomDetailContent />;
}
