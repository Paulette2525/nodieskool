import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CourseCard } from "@/components/classroom/CourseCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, BookOpen, Plus, Edit, ImagePlus, X } from "lucide-react";
import { useCoursesWithCommunity } from "@/hooks/useCourses";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStorage } from "@/hooks/useStorage";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

function ThumbnailUpload({
  previewSrc,
  onFileChange,
  onClear,
  fileInputRef,
}: {
  previewSrc: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div className="space-y-2">
      <Label>Miniature</Label>
      {previewSrc ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
          <img src={previewSrc} alt="Aperçu" className="w-full h-full object-cover" />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
        >
          <ImagePlus className="h-8 w-8" />
          <span className="text-sm">Cliquez pour importer une image</span>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}

function CommunityClassroomContent() {
  const { community, isAdmin } = useCommunityContext();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { courses, completedLessons, isLoading } = useCoursesWithCommunity(community?.id);
  const { profile } = useAuth();
  const { uploadCourseThumbnail, uploading } = useStorage();
  const queryClient = useQueryClient();

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [createPreview, setCreatePreview] = useState<string | null>(null);
  const createFileRef = useRef<HTMLInputElement>(null);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<typeof courses[0] | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPublished, setEditPublished] = useState(true);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editExistingUrl, setEditExistingUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

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
      let thumbnailUrl: string | null = null;
      if (createFile) {
        thumbnailUrl = await uploadCourseThumbnail(createFile);
        if (!thumbnailUrl) throw new Error("Échec de l'upload");
      }
      const { error } = await supabase.from("courses").insert({
        title,
        description,
        thumbnail_url: thumbnailUrl,
        created_by: profile.id,
        community_id: community.id,
        is_published: true,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Cours créé avec succès !");
      setTitle("");
      setDescription("");
      setCreateFile(null);
      setCreatePreview(null);
      setCreateOpen(false);
    } catch (error: any) {
      toast.error("Erreur : " + error.message);
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (course: typeof courses[0]) => {
    setEditCourse(course);
    setEditTitle(course.title);
    setEditDescription(course.description || "");
    setEditPublished(course.is_published);
    setEditFile(null);
    setEditPreview(null);
    setEditExistingUrl(course.thumbnail_url || null);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editCourse) return;
    setSaving(true);
    try {
      let thumbnailUrl = editExistingUrl;
      if (editFile) {
        const url = await uploadCourseThumbnail(editFile);
        if (!url) throw new Error("Échec de l'upload");
        thumbnailUrl = url;
      }
      const { error } = await supabase.from("courses").update({
        title: editTitle,
        description: editDescription || null,
        thumbnail_url: thumbnailUrl,
        is_published: editPublished,
      }).eq("id", editCourse.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Formation mise à jour !");
      setEditOpen(false);
    } catch (error: any) {
      toast.error("Erreur : " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const editPreviewSrc = editFile ? URL.createObjectURL(editFile) : editExistingUrl;

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
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
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
                <ThumbnailUpload
                  previewSrc={createPreview}
                  onFileChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setCreateFile(f); setCreatePreview(URL.createObjectURL(f)); }
                  }}
                  onClear={() => { setCreateFile(null); setCreatePreview(null); if (createFileRef.current) createFileRef.current.value = ""; }}
                  fileInputRef={createFileRef as React.RefObject<HTMLInputElement>}
                />
                <Button type="submit" className="w-full" disabled={creating || uploading}>
                  {(creating || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer le cours
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la formation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} />
            </div>
            <ThumbnailUpload
              previewSrc={editPreviewSrc}
              onFileChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setEditFile(f); setEditPreview(URL.createObjectURL(f)); }
              }}
              onClear={() => { setEditFile(null); setEditPreview(null); setEditExistingUrl(null); if (editFileRef.current) editFileRef.current.value = ""; }}
              fileInputRef={editFileRef as React.RefObject<HTMLInputElement>}
            />
            <div className="flex items-center justify-between">
              <Label>Publié</Label>
              <Switch checked={editPublished} onCheckedChange={setEditPublished} />
            </div>
            <Button className="w-full" onClick={handleEditSave} disabled={saving || uploading || !editTitle}>
              {(saving || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
              <div key={course.id} className="relative group">
                <CourseCard
                  id={course.id}
                  title={course.title}
                  description={course.description || ""}
                  thumbnailUrl={course.thumbnail_url}
                  totalLessons={progress.total}
                  completedLessons={progress.completed}
                  progress={progress.progress}
                  isLocked={false}
                  onClick={() => navigate(`/c/${slug}/classroom/${course.id}`)}
                />
                {isAdmin && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEdit(course); }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
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
