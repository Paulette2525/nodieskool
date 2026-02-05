 import { Link, useNavigate } from "react-router-dom";
 import { Card } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Users, Crown, Shield, User, MoreVertical, Pencil, Trash2, Link2, ExternalLink } from "lucide-react";
 import { cn } from "@/lib/utils";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
 import { Button } from "@/components/ui/button";
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
 } from "@/components/ui/alert-dialog";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { Switch } from "@/components/ui/switch";
 import { useState } from "react";
 import { toast } from "sonner";
 import { supabase } from "@/integrations/supabase/client";
 import { useQueryClient } from "@tanstack/react-query";
 
 interface CommunityCardProps {
   id: string;
   name: string;
   slug: string;
   description: string | null;
   logoUrl: string | null;
   coverUrl: string | null;
   primaryColor: string | null;
   isPublic: boolean;
   role?: "owner" | "admin" | "moderator" | "member";
   memberCount?: number;
   showActions?: boolean;
 }
 
 const roleConfig = {
   owner: { label: "Propriétaire", icon: Crown, color: "bg-amber-500" },
   admin: { label: "Admin", icon: Shield, color: "bg-primary" },
   moderator: { label: "Modérateur", icon: Shield, color: "bg-blue-500" },
   member: { label: "Membre", icon: User, color: "bg-muted" },
 };
 
 export function CommunityCard({
   id,
   name,
   slug,
   description,
   logoUrl,
   coverUrl,
   primaryColor,
   isPublic,
   role,
   memberCount,
   showActions = true,
 }: CommunityCardProps) {
   const roleInfo = role ? roleConfig[role] : null;
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
   const [showEditDialog, setShowEditDialog] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [editForm, setEditForm] = useState({
     name: name,
     description: description || "",
     is_public: isPublic,
   });

   const isOwner = role === "owner";
   const communityUrl = `${window.location.origin}/c/${slug}/community`;

   const handleCopyLink = (e: React.MouseEvent) => {
     e.preventDefault();
     e.stopPropagation();
     navigator.clipboard.writeText(communityUrl);
     toast.success("Lien copié dans le presse-papier !");
   };

   const handleDelete = async () => {
     setIsDeleting(true);
     try {
       // Delete community members first (due to foreign key)
       await supabase
         .from("community_members")
         .delete()
         .eq("community_id", id);

       // Delete the community
       const { error } = await supabase
         .from("communities")
         .delete()
         .eq("id", id);

       if (error) throw error;

       toast.success("Communauté supprimée avec succès");
       queryClient.invalidateQueries({ queryKey: ["my-communities"] });
       setShowDeleteDialog(false);
     } catch (error: any) {
       toast.error("Erreur lors de la suppression: " + error.message);
     } finally {
       setIsDeleting(false);
     }
   };

   const handleSaveEdit = async () => {
     setIsSaving(true);
     try {
       const { error } = await supabase
         .from("communities")
         .update({
           name: editForm.name,
           description: editForm.description || null,
           is_public: editForm.is_public,
         })
         .eq("id", id);

       if (error) throw error;

       toast.success("Communauté mise à jour avec succès");
       queryClient.invalidateQueries({ queryKey: ["my-communities"] });
       setShowEditDialog(false);
     } catch (error: any) {
       toast.error("Erreur lors de la mise à jour: " + error.message);
     } finally {
       setIsSaving(false);
     }
   };
 
   return (
     <>
       <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group relative">
         {/* Cover image */}
         <div 
           className="h-24 bg-gradient-to-r from-primary/20 to-primary/40 relative"
           style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
         >
           {roleInfo && (
             <Badge 
               className={cn("absolute top-2 right-2", roleInfo.color)}
               variant="secondary"
             >
               <roleInfo.icon className="h-3 w-3 mr-1" />
               {roleInfo.label}
             </Badge>
           )}
           {/* Actions menu for owners */}
           {isOwner && showActions && (
             <DropdownMenu>
               <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                 <Button
                   variant="secondary"
                   size="icon"
                   className="absolute top-2 left-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                 >
                   <MoreVertical className="h-4 w-4" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                 <DropdownMenuItem onClick={handleCopyLink}>
                   <Link2 className="h-4 w-4 mr-2" />
                   Copier le lien d'invitation
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={(e) => {
                   e.preventDefault();
                   window.open(communityUrl, '_blank');
                 }}>
                   <ExternalLink className="h-4 w-4 mr-2" />
                   Ouvrir dans un nouvel onglet
                 </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={(e) => {
                   e.preventDefault();
                   setEditForm({ name, description: description || "", is_public: isPublic });
                   setShowEditDialog(true);
                 }}>
                   <Pencil className="h-4 w-4 mr-2" />
                   Modifier
                 </DropdownMenuItem>
                 <DropdownMenuItem
                   className="text-destructive focus:text-destructive"
                   onClick={(e) => {
                     e.preventDefault();
                     setShowDeleteDialog(true);
                   }}
                 >
                   <Trash2 className="h-4 w-4 mr-2" />
                   Supprimer
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           )}
         </div>
 
         {/* Content */}
         <Link to={`/c/${slug}/community`} className="block p-4 pt-0 relative">
           {/* Logo */}
           <Avatar className="h-14 w-14 border-4 border-background -mt-7 mb-2 ring-2 ring-muted">
             <AvatarImage src={logoUrl || undefined} alt={name} />
             <AvatarFallback 
               className="text-lg font-bold"
               style={{ backgroundColor: primaryColor || undefined }}
             >
               {name.charAt(0).toUpperCase()}
             </AvatarFallback>
           </Avatar>
 
           {/* Info */}
           <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
             {name}
           </h3>
           {description && (
             <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
               {description}
             </p>
           )}
 
           {/* Footer */}
           <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
             {memberCount !== undefined && (
               <span className="flex items-center gap-1">
                 <Users className="h-3 w-3" />
                 {memberCount} membres
               </span>
             )}
             <Badge variant={isPublic ? "secondary" : "outline"} className="text-xs">
               {isPublic ? "Public" : "Privé"}
             </Badge>
           </div>
         </Link>
       </Card>

       {/* Delete confirmation dialog */}
       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Supprimer la communauté</AlertDialogTitle>
             <AlertDialogDescription>
               Êtes-vous sûr de vouloir supprimer "{name}" ? Cette action est irréversible et supprimera tous les membres, posts, formations et événements associés.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
             <AlertDialogAction
               onClick={handleDelete}
               disabled={isDeleting}
               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
             >
               {isDeleting ? "Suppression..." : "Supprimer"}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>

       {/* Edit dialog */}
       <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Modifier la communauté</DialogTitle>
             <DialogDescription>
               Modifiez les informations de votre communauté
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label htmlFor="edit-name">Nom de la communauté</Label>
               <Input
                 id="edit-name"
                 value={editForm.name}
                 onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                 placeholder="Ma communauté"
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="edit-description">Description</Label>
               <Textarea
                 id="edit-description"
                 value={editForm.description}
                 onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                 placeholder="Décrivez votre communauté..."
                 rows={3}
               />
             </div>
             <div className="flex items-center justify-between">
               <div className="space-y-0.5">
                 <Label>Communauté publique</Label>
                 <p className="text-sm text-muted-foreground">
                   Les communautés publiques sont visibles par tous
                 </p>
               </div>
               <Switch
                 checked={editForm.is_public}
                 onCheckedChange={(checked) => setEditForm({ ...editForm, is_public: checked })}
               />
             </div>
             <div className="space-y-2">
               <Label>Lien d'invitation</Label>
               <div className="flex gap-2">
                 <Input value={communityUrl} readOnly className="bg-muted" />
                 <Button variant="outline" size="icon" onClick={handleCopyLink}>
                   <Link2 className="h-4 w-4" />
                 </Button>
               </div>
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSaving}>
               Annuler
             </Button>
             <Button onClick={handleSaveEdit} disabled={isSaving || !editForm.name.trim()}>
               {isSaving ? "Enregistrement..." : "Enregistrer"}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </>
   );
 }