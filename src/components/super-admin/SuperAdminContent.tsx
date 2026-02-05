 import { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
 } from "@/components/ui/alert-dialog";
 import { Search, Trash2, Heart, MessageSquare, ExternalLink } from "lucide-react";
 import { PlatformPost } from "@/hooks/useSuperAdmin";
 import { UseMutationResult } from "@tanstack/react-query";
 
 interface SuperAdminContentProps {
   posts: PlatformPost[];
   deletePost: UseMutationResult<void, Error, string>;
 }
 
 export function SuperAdminContent({ posts, deletePost }: SuperAdminContentProps) {
   const [search, setSearch] = useState("");
 
   const filteredPosts = posts.filter(
     (p) =>
       p.content.toLowerCase().includes(search.toLowerCase()) ||
       p.author_username.toLowerCase().includes(search.toLowerCase()) ||
       (p.community_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
   );
 
   const truncateContent = (content: string, maxLength = 100) => {
     if (content.length <= maxLength) return content;
     return content.substring(0, maxLength) + "...";
   };
 
   return (
     <Card>
       <CardHeader>
         <div className="flex flex-col sm:flex-row justify-between gap-4">
           <CardTitle>Posts Récents ({posts.length})</CardTitle>
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Rechercher..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="pl-9 w-full sm:w-64"
             />
           </div>
         </div>
       </CardHeader>
       <CardContent>
         <div className="overflow-x-auto">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead className="min-w-[300px]">Contenu</TableHead>
                 <TableHead>Auteur</TableHead>
                 <TableHead>Communauté</TableHead>
                 <TableHead className="text-center">Engagement</TableHead>
                 <TableHead>Date</TableHead>
                 <TableHead className="text-right">Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filteredPosts.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                     Aucun post trouvé
                   </TableCell>
                 </TableRow>
               ) : (
                 filteredPosts.map((post) => (
                   <TableRow key={post.id}>
                     <TableCell>
                       <div className="max-w-[300px]">
                         <p className="text-sm">{truncateContent(post.content)}</p>
                         {post.image_url && (
                           <Badge variant="outline" className="mt-1">
                             Avec image
                           </Badge>
                         )}
                       </div>
                     </TableCell>
                     <TableCell>
                       <div>
                         <p className="font-medium">
                           {post.author_full_name || post.author_username}
                         </p>
                         <p className="text-xs text-muted-foreground">@{post.author_username}</p>
                       </div>
                     </TableCell>
                     <TableCell>
                       {post.community_name ? (
                         <a
                           href={`/c/${post.community_slug}`}
                           className="text-primary hover:underline flex items-center gap-1"
                           target="_blank"
                           rel="noopener"
                         >
                           {post.community_name}
                           <ExternalLink className="h-3 w-3" />
                         </a>
                       ) : (
                         <span className="text-muted-foreground">-</span>
                       )}
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center justify-center gap-4">
                         <div className="flex items-center gap-1 text-sm">
                           <Heart className="h-4 w-4 text-red-500" />
                           {post.likes_count}
                         </div>
                         <div className="flex items-center gap-1 text-sm">
                           <MessageSquare className="h-4 w-4 text-blue-500" />
                           {post.comments_count}
                         </div>
                       </div>
                     </TableCell>
                     <TableCell>
                       <div className="text-sm">
                         {new Date(post.created_at).toLocaleDateString("fr-FR")}
                       </div>
                       <div className="text-xs text-muted-foreground">
                         {new Date(post.created_at).toLocaleTimeString("fr-FR", {
                           hour: "2-digit",
                           minute: "2-digit",
                         })}
                       </div>
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center justify-end">
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon">
                               <Trash2 className="h-4 w-4 text-destructive" />
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Supprimer ce post ?</AlertDialogTitle>
                               <AlertDialogDescription>
                                 Cette action supprimera définitivement ce post et tous ses
                                 commentaires. Cette action est irréversible.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Annuler</AlertDialogCancel>
                               <AlertDialogAction
                                 onClick={() => deletePost.mutate(post.id)}
                                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                               >
                                 Supprimer
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))
               )}
             </TableBody>
           </Table>
         </div>
       </CardContent>
     </Card>
   );
 }