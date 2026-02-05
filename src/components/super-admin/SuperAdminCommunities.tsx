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
 import { Search, Power, Trash2, ExternalLink, Users, FileText, BookOpen } from "lucide-react";
 import { PlatformCommunity } from "@/hooks/useSuperAdmin";
 import { UseMutationResult } from "@tanstack/react-query";
 
 interface SuperAdminCommunitiesProps {
   communities: PlatformCommunity[];
   toggleCommunityActive: UseMutationResult<void, Error, { communityId: string; isActive: boolean }>;
   deleteCommunity: UseMutationResult<void, Error, string>;
 }
 
 export function SuperAdminCommunities({
   communities,
   toggleCommunityActive,
   deleteCommunity,
 }: SuperAdminCommunitiesProps) {
   const [search, setSearch] = useState("");
 
   const filteredCommunities = communities.filter(
     (c) =>
       c.name.toLowerCase().includes(search.toLowerCase()) ||
       c.slug.toLowerCase().includes(search.toLowerCase()) ||
       c.owner_username.toLowerCase().includes(search.toLowerCase())
   );
 
   return (
     <Card>
       <CardHeader>
         <div className="flex flex-col sm:flex-row justify-between gap-4">
           <CardTitle>Toutes les Communautés ({communities.length})</CardTitle>
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
                 <TableHead>Communauté</TableHead>
                 <TableHead>Propriétaire</TableHead>
                 <TableHead className="text-center">Membres</TableHead>
                 <TableHead className="text-center">Posts</TableHead>
                 <TableHead className="text-center">Cours</TableHead>
                 <TableHead className="text-center">Statut</TableHead>
                 <TableHead className="text-right">Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filteredCommunities.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                     Aucune communauté trouvée
                   </TableCell>
                 </TableRow>
               ) : (
                 filteredCommunities.map((community) => (
                   <TableRow key={community.id}>
                     <TableCell>
                       <div className="flex items-center gap-3">
                         {community.logo_url ? (
                           <img
                             src={community.logo_url}
                             alt={community.name}
                             className="h-10 w-10 rounded-lg object-cover"
                           />
                         ) : (
                           <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                             <span className="text-primary font-bold">
                               {community.name.charAt(0)}
                             </span>
                           </div>
                         )}
                         <div>
                           <p className="font-medium">{community.name}</p>
                           <p className="text-xs text-muted-foreground">/{community.slug}</p>
                         </div>
                       </div>
                     </TableCell>
                     <TableCell>
                       <div>
                         <p className="font-medium">
                           {community.owner_full_name || community.owner_username}
                         </p>
                         <p className="text-xs text-muted-foreground">@{community.owner_username}</p>
                       </div>
                     </TableCell>
                     <TableCell className="text-center">
                       <div className="flex items-center justify-center gap-1">
                         <Users className="h-4 w-4 text-muted-foreground" />
                         {community.members_count}
                       </div>
                     </TableCell>
                     <TableCell className="text-center">
                       <div className="flex items-center justify-center gap-1">
                         <FileText className="h-4 w-4 text-muted-foreground" />
                         {community.posts_count}
                       </div>
                     </TableCell>
                     <TableCell className="text-center">
                       <div className="flex items-center justify-center gap-1">
                         <BookOpen className="h-4 w-4 text-muted-foreground" />
                         {community.courses_count}
                       </div>
                     </TableCell>
                     <TableCell className="text-center">
                       <Badge variant={community.is_active ? "default" : "secondary"}>
                         {community.is_active ? "Active" : "Inactive"}
                       </Badge>
                       {!community.is_public && (
                         <Badge variant="outline" className="ml-1">
                           Privée
                         </Badge>
                       )}
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center justify-end gap-2">
                         <Button
                           variant="ghost"
                           size="icon"
                           asChild
                         >
                           <a href={`/c/${community.slug}`} target="_blank" rel="noopener">
                             <ExternalLink className="h-4 w-4" />
                           </a>
                         </Button>
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={() =>
                             toggleCommunityActive.mutate({
                               communityId: community.id,
                               isActive: !community.is_active,
                             })
                           }
                           disabled={toggleCommunityActive.isPending}
                         >
                           <Power
                             className={`h-4 w-4 ${
                               community.is_active ? "text-green-500" : "text-muted-foreground"
                             }`}
                           />
                         </Button>
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon">
                               <Trash2 className="h-4 w-4 text-destructive" />
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Supprimer la communauté ?</AlertDialogTitle>
                               <AlertDialogDescription>
                                 Cette action supprimera définitivement la communauté "{community.name}"
                                 et tout son contenu. Cette action est irréversible.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Annuler</AlertDialogCancel>
                               <AlertDialogAction
                                 onClick={() => deleteCommunity.mutate(community.id)}
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