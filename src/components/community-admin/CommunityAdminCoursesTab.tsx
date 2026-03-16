import { useState, useRef } from "react";
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
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useStorage } from "@/hooks/useStorage";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  order_index: number;
  created_at: string;
}

interface CommunityAdminCoursesTabProps {
  courses: Course[];
}

export function CommunityAdminCoursesTab({ courses }: CommunityAdminCoursesTabProps) {
  const { communityId } = useCommunityContext();
  const queryClient = useQueryClient();
  const { uploadCourseThumbnail, uploading } = useStorage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
    is_published: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setCourseForm({ ...courseForm, thumbnail_url: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveCourse = useMutation({
    mutationFn: async (course: typeof courseForm & { id?: string }) => {
      let thumbnailUrl = course.thumbnail_url || null;

      if (thumbnailFile) {
        const url = await uploadCourseThumbnail(thumbnailFile);
        if (!url) throw new Error("Échec de l'upload de la miniature");
        thumbnailUrl = url;
      }

      if (course.id) {
        const { error } = await supabase
          .from("courses")
          .update({
            title: course.title,
            description: course.description || null,
            thumbnail_url: thumbnailUrl,
            is_published: course.is_published,
          })
          .eq("id", course.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert({
          title: course.title,
          description: course.description || null,
          thumbnail_url: thumbnailUrl,
          is_published: course.is_published,
          order_index: courses.length,
          community_id: communityId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-admin-courses", communityId] });
      queryClient.invalidateQueries({ queryKey: ["community-admin-stats", communityId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      resetForm();
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
      queryClient.invalidateQueries({ queryKey: ["community-admin-courses", communityId] });
      queryClient.invalidateQueries({ queryKey: ["community-admin-stats", communityId] });
      toast.success("Formation supprimée");
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
      queryClient.invalidateQueries({ queryKey: ["community-admin-courses", communityId] });
    },
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingCourse(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setCourseForm({ title: "", description: "", thumbnail_url: "", is_published: false });
  };

  const openEditCourse = (course: Course) => {
    setEditingCourse(course);
    setThumbnailFile(null);
    setThumbnailPreview(course.thumbnail_url || null);
    setCourseForm({
      title: course.title,
      description: course.description || "",
      thumbnail_url: course.thumbnail_url || "",
      is_published: course.is_published,
    });
    setDialogOpen(true);
  };

  const previewSrc = thumbnailPreview || courseForm.thumbnail_url || null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Formations ({courses.length})
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => { resetForm(); setDialogOpen(true); }}
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
                <Label>Miniature</Label>
                {previewSrc ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                    <img src={previewSrc} alt="Aperçu" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={clearThumbnail}
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
                  onChange={handleFileChange}
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
                disabled={saveCourse.isPending || uploading || !courseForm.title}
              >
                {(saveCourse.isPending || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCourse ? "Mettre à jour" : "Créer la formation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune formation. Créez votre première formation !
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Formation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {course.thumbnail_url && (
                        <img src={course.thumbnail_url} alt="" className="h-10 w-16 rounded object-cover shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{course.title}</p>
                        {course.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {course.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(course.created_at), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditCourse(course)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
