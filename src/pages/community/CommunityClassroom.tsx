import { useState } from "react";
import { CommunityLayout } from "@/components/layout/CommunityLayout";
import { CourseCard } from "@/components/classroom/CourseCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, BookOpen, Plus } from "lucide-react";
import { useCoursesWithCommunity } from "@/hooks/useCourses";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

function CommunityClassroomContent() {
  const { community, isAdmin } = useCommunityContext();
  const { courses, completedLessons, isLoading } = useCoursesWithCommunity(community?.id);
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const getCourseProgress = (course: typeof courses[0]) => {
    const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
    const completed = course.modules?.reduce((acc, m) => {
      return acc + (m.lessons?.filter(l => completedLessons.includes(l.id)).length || 0);
    }, 0) || 0;
    const progress = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
    return { total: totalLessons, completed, progress };
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !community) return;
    setCreating(true);
    try {
      const { error } = await supabase.from("courses").insert({
        title,
        description,
        created_by: profile.id,
        community_id: community.id,
        is_published: true,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Cours créé avec succès !");
      setTitle("");
      setDescription("");
      setOpen(false);
    } catch (error: any) {
      toast.error("Erreur : " + error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Formations</h1>
          <p className="text-muted-foreground mt-1">
            Développez vos compétences avec nos cours
          </p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau cours
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau cours</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="course-title">Titre</Label>
                  <Input id="course-title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Introduction au marketing" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-desc">Description</Label>
                  <Textarea id="course-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description du cours..." rows={3} />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer le cours
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucun cours disponible</h3>
          <p className="text-muted-foreground">
            Les cours seront bientôt disponibles
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const progress = getCourseProgress(course);
            return (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description || ""}
                thumbnailUrl={course.thumbnail_url}
                totalLessons={progress.total}
                completedLessons={progress.completed}
                progress={progress.progress}
                isLocked={false}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CommunityClassroom() {
  return (
    <CommunityLayout>
      <CommunityClassroomContent />
    </CommunityLayout>
  );
}
