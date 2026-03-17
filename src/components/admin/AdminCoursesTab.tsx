import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Layers,
  PlayCircle,
  Loader2,
  GripVertical,
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  order_index: number;
  created_at: string;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  order_index: number;
  is_locked: boolean;
}

interface Lesson {
  id: string;
  title: string;
  module_id: string;
  video_url: string | null;
  duration_minutes: number | null;
  points_reward: number;
  order_index: number;
}

export function AdminCoursesTab() {
  const queryClient = useQueryClient();
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
    is_published: false,
  });
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    is_locked: false,
  });
  const [lessonForm, setLessonForm] = useState({
    title: "",
    video_url: "",
    duration_minutes: "",
    points_reward: "10",
    content: "",
  });

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as Course[];
    },
  });

  // Fetch modules
  const { data: modules = [] } = useQuery({
    queryKey: ["admin-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as Module[];
    },
  });

  // Fetch lessons
  const { data: lessons = [] } = useQuery({
    queryKey: ["admin-lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as Lesson[];
    },
  });

  // Mutations
  const saveCourse = useMutation({
    mutationFn: async (course: typeof courseForm & { id?: string }) => {
      if (course.id) {
        const { error } = await supabase
          .from("courses")
          .update({
            title: course.title,
            description: course.description || null,
            thumbnail_url: course.thumbnail_url || null,
            is_published: course.is_published,
          })
          .eq("id", course.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert({
          title: course.title,
          description: course.description || null,
          thumbnail_url: course.thumbnail_url || null,
          is_published: course.is_published,
          order_index: courses.length,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setCourseDialogOpen(false);
      setEditingCourse(null);
      setCourseForm({ title: "", description: "", thumbnail_url: "", is_published: false });
      toast.success("Formation enregistrée");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Formation supprimée");
    },
  });

  const saveModule = useMutation({
    mutationFn: async (module: typeof moduleForm & { id?: string; course_id: string }) => {
      if (module.id) {
        const { error } = await supabase
          .from("modules")
          .update({
            title: module.title,
            description: module.description || null,
            is_locked: module.is_locked,
          })
          .eq("id", module.id);
        if (error) throw error;
      } else {
        const courseModules = modules.filter(m => m.course_id === module.course_id);
        const { error } = await supabase.from("modules").insert({
          title: module.title,
          description: module.description || null,
          is_locked: module.is_locked,
          course_id: module.course_id,
          order_index: courseModules.length,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] });
      setModuleDialogOpen(false);
      setEditingModule(null);
      setModuleForm({ title: "", description: "", is_locked: false });
      toast.success("Module enregistré");
    },
  });

  const deleteModule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("modules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] });
      toast.success("Module supprimé");
    },
  });

  const saveLesson = useMutation({
    mutationFn: async (lesson: typeof lessonForm & { id?: string; module_id: string }) => {
      if (lesson.id) {
        const { error } = await supabase
          .from("lessons")
          .update({
            title: lesson.title,
            video_url: lesson.video_url || null,
            duration_minutes: lesson.duration_minutes ? parseInt(lesson.duration_minutes) : null,
            points_reward: parseInt(lesson.points_reward) || 10,
            content: lesson.content || null,
          })
          .eq("id", lesson.id);
        if (error) throw error;
      } else {
        const moduleLessons = lessons.filter(l => l.module_id === lesson.module_id);
        const { error } = await supabase.from("lessons").insert({
          title: lesson.title,
          video_url: lesson.video_url || null,
          duration_minutes: lesson.duration_minutes ? parseInt(lesson.duration_minutes) : null,
          points_reward: parseInt(lesson.points_reward) || 10,
          content: lesson.content || null,
          module_id: lesson.module_id,
          order_index: moduleLessons.length,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      setLessonDialogOpen(false);
      setEditingLesson(null);
      setLessonForm({ title: "", video_url: "", duration_minutes: "", points_reward: "10", content: "" });
      toast.success("Leçon enregistrée");
    },
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      toast.success("Leçon supprimée");
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from("courses")
        .update({ is_published })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
  });

  const openEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description || "",
      thumbnail_url: course.thumbnail_url || "",
      is_published: course.is_published,
    });
    setCourseDialogOpen(true);
  };

  const openAddModule = (courseId: string) => {
    setSelectedCourseId(courseId);
    setEditingModule(null);
    setModuleForm({ title: "", description: "", is_locked: false });
    setModuleDialogOpen(true);
  };

  const openEditModule = (module: Module) => {
    setSelectedCourseId(module.course_id);
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description || "",
      is_locked: module.is_locked,
    });
    setModuleDialogOpen(true);
  };

  const openAddLesson = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setEditingLesson(null);
    setLessonForm({ title: "", video_url: "", duration_minutes: "", points_reward: "10", content: "" });
    setLessonDialogOpen(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setSelectedModuleId(lesson.module_id);
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      video_url: lesson.video_url || "",
      duration_minutes: lesson.duration_minutes?.toString() || "",
      points_reward: lesson.points_reward.toString(),
      content: "",
    });
    setLessonDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Gestion des Formations ({courses.length})
        </CardTitle>
        <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                setEditingCourse(null);
                setCourseForm({ title: "", description: "", thumbnail_url: "", is_published: false });
              }}
            >
              <Plus className="h-4 w-4" />
              Nouvelle Formation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? "Modifier la Formation" : "Nouvelle Formation"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Titre *</Label>
                <Input
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="Introduction au marketing"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Décrivez le contenu de cette formation..."
                />
              </div>
              <div className="space-y-2">
                <Label>URL de la miniature</Label>
                <Input
                  value={courseForm.thumbnail_url}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Publier immédiatement</Label>
                <Switch
                  checked={courseForm.is_published}
                  onCheckedChange={(checked) => setCourseForm({ ...courseForm, is_published: checked })}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => saveCourse.mutate({ ...courseForm, id: editingCourse?.id })}
                disabled={saveCourse.isPending || !courseForm.title}
              >
                {saveCourse.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCourse ? "Mettre à jour" : "Créer la formation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {coursesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune formation. Créez votre première formation !
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {courses.map((course) => (
              <AccordionItem key={course.id} value={course.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{course.title}</span>
                      {course.is_published ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Eye className="h-3 w-3 mr-1" />
                          Publié
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Brouillon
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditCourse(course)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openAddModule(course.id)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un module
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => togglePublish.mutate({ id: course.id, is_published: !course.is_published })}
                      >
                        {course.is_published ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Dépublier
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Publier
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteCourse.mutate(course.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </AccordionTrigger>
                <AccordionContent className="pl-8">
                  {course.description && (
                    <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                  )}
                  
                  {/* Modules */}
                  <div className="space-y-3">
                    {modules
                      .filter((m) => m.course_id === course.id)
                      .map((module) => (
                        <div
                          key={module.id}
                          className="border rounded-lg p-4 bg-muted/30"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4 text-primary" />
                              <span className="font-medium">{module.title}</span>
                              {module.is_locked && (
                                <Badge variant="secondary" className="text-xs">Verrouillé</Badge>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openAddLesson(module.id)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Leçon
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModule(module)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => deleteModule.mutate(module.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Lessons */}
                          <div className="ml-6 space-y-2">
                            {lessons
                              .filter((l) => l.module_id === module.id)
                              .map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between py-2 px-3 rounded bg-background"
                                >
                                  <div className="flex items-center gap-2">
                                    <PlayCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{lesson.title}</span>
                                    {lesson.duration_minutes && (
                                      <span className="text-xs text-muted-foreground">
                                        ({lesson.duration_minutes} min)
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openEditLesson(lesson)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive"
                                      onClick={() => deleteLesson.mutate(lesson.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            {lessons.filter((l) => l.module_id === module.id).length === 0 && (
                              <p className="text-xs text-muted-foreground italic py-2">
                                Aucune leçon dans ce module
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    {modules.filter((m) => m.course_id === course.id).length === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddModule(course.id)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter le premier module
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Module Dialog */}
        <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingModule ? "Modifier le Module" : "Nouveau Module"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Titre *</Label>
                <Input
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="Module 1: Les bases"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Décrivez ce module..."
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Module verrouillé</Label>
                <Switch
                  checked={moduleForm.is_locked}
                  onCheckedChange={(checked) => setModuleForm({ ...moduleForm, is_locked: checked })}
                />
              </div>
              <Button
                className="w-full"
                onClick={() =>
                  saveModule.mutate({
                    ...moduleForm,
                    id: editingModule?.id,
                    course_id: selectedCourseId!,
                  })
                }
                disabled={saveModule.isPending || !moduleForm.title}
              >
                {saveModule.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingModule ? "Mettre à jour" : "Créer le module"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lesson Dialog */}
        <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLesson ? "Modifier la Leçon" : "Nouvelle Leçon"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Titre *</Label>
                <Input
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="Introduction au sujet"
                />
              </div>
              <div className="space-y-2">
                <Label>URL de la vidéo</Label>
                <Input
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Durée (minutes)</Label>
                  <Input
                    type="number"
                    value={lessonForm.duration_minutes}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: e.target.value })}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Points de récompense</Label>
                  <Input
                    type="number"
                    value={lessonForm.points_reward}
                    onChange={(e) => setLessonForm({ ...lessonForm, points_reward: e.target.value })}
                    placeholder="10"
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() =>
                  saveLesson.mutate({
                    ...lessonForm,
                    id: editingLesson?.id,
                    module_id: selectedModuleId!,
                  })
                }
                disabled={saveLesson.isPending || !lessonForm.title}
              >
                {saveLesson.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingLesson ? "Mettre à jour" : "Créer la leçon"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
