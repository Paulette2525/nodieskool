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
 } from "lucide-react";
 import { format } from "date-fns";
 import { supabase } from "@/integrations/supabase/client";
 import { useMutation, useQueryClient } from "@tanstack/react-query";
 import { toast } from "sonner";
 import { useCommunityContext } from "@/contexts/CommunityContext";
 
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
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingCourse, setEditingCourse] = useState<Course | null>(null);
 
   const [courseForm, setCourseForm] = useState({
     title: "",
     description: "",
     thumbnail_url: "",
     is_published: false,
   });
 
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
           community_id: communityId,
         });
         if (error) throw error;
       }
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["community-admin-courses", communityId] });
       queryClient.invalidateQueries({ queryKey: ["community-admin-stats", communityId] });
       setDialogOpen(false);
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
 
   const openEditCourse = (course: Course) => {
     setEditingCourse(course);
     setCourseForm({
       title: course.title,
       description: course.description || "",
       thumbnail_url: course.thumbnail_url || "",
       is_published: course.is_published,
     });
     setDialogOpen(true);
   };
 
   return (
     <Card>
       <CardHeader className="flex flex-row items-center justify-between">
         <CardTitle className="flex items-center gap-2">
           <BookOpen className="h-5 w-5" />
           Formations ({courses.length})
         </CardTitle>
         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                     <div>
                       <p className="font-medium">{course.title}</p>
                       {course.description && (
                         <p className="text-xs text-muted-foreground truncate max-w-xs">
                           {course.description}
                         </p>
                       )}
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