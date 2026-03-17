 import { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
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
 import { Search, MoreHorizontal, Shield, ShieldAlert, Trash2, Building2 } from "lucide-react";
 import { PlatformUser } from "@/hooks/useSuperAdmin";
 import { UseMutationResult } from "@tanstack/react-query";
 
 interface SuperAdminUsersProps {
   users: PlatformUser[];
   updateUserRole: UseMutationResult<void, Error, { userId: string; role: "admin" | "moderator" | "member"; action: "add" | "remove" }>;
   deleteUser: UseMutationResult<void, Error, string>;
 }
 
 export function SuperAdminUsers({ users, updateUserRole, deleteUser }: SuperAdminUsersProps) {
   const [search, setSearch] = useState("");
 
   const filteredUsers = users.filter(
     (u) =>
       u.username.toLowerCase().includes(search.toLowerCase()) ||
       (u.full_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
   );
 
   const getRoleBadge = (role: string | null) => {
     switch (role) {
       case "admin":
         return <Badge variant="default" className="bg-red-500">Admin</Badge>;
       case "moderator":
         return <Badge variant="default" className="bg-orange-500">Modérateur</Badge>;
       default:
         return <Badge variant="secondary">Membre</Badge>;
     }
   };
 
   return (
     <Card>
       <CardHeader>
         <div className="flex flex-col sm:flex-row justify-between gap-4">
           <CardTitle>Tous les Utilisateurs ({users.length})</CardTitle>
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
                  <TableHead>Utilisateur</TableHead>
                  <TableHead className="text-center">Communautés</TableHead>
                  <TableHead className="text-center">Rôle Plateforme</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
               {filteredUsers.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                     Aucun utilisateur trouvé
                   </TableCell>
                 </TableRow>
               ) : (
                 filteredUsers.map((user) => (
                   <TableRow key={user.id}>
                     <TableCell>
                       <div className="flex items-center gap-3">
                         <Avatar className="h-10 w-10">
                           <AvatarImage src={user.avatar_url ?? undefined} />
                           <AvatarFallback>
                             {(user.full_name || user.username).charAt(0).toUpperCase()}
                           </AvatarFallback>
                         </Avatar>
                         <div>
                           <p className="font-medium">{user.full_name || user.username}</p>
                           <p className="text-xs text-muted-foreground">@{user.username}</p>
                         </div>
                       </div>
                     </TableCell>
                     <TableCell className="text-center">
                       <span className="font-bold text-primary">Niv. {user.level}</span>
                     </TableCell>
                     <TableCell className="text-center">{user.points}</TableCell>
                     <TableCell className="text-center">
                       <div className="flex items-center justify-center gap-1">
                         <Building2 className="h-4 w-4 text-muted-foreground" />
                         {user.communities_count}
                       </div>
                     </TableCell>
                     <TableCell className="text-center">
                       {getRoleBadge(user.platform_role)}
                     </TableCell>
                     <TableCell>
                       {new Date(user.created_at).toLocaleDateString("fr-FR")}
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center justify-end">
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon">
                               <MoreHorizontal className="h-4 w-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             <DropdownMenuSeparator />
                             {user.platform_role !== "admin" && (
                               <DropdownMenuItem
                                 onClick={() =>
                                   updateUserRole.mutate({
                                     userId: user.user_id,
                                     role: "admin",
                                     action: "add",
                                   })
                                 }
                               >
                                 <ShieldAlert className="h-4 w-4 mr-2" />
                                 Promouvoir Admin
                               </DropdownMenuItem>
                             )}
                             {user.platform_role === "admin" && (
                               <DropdownMenuItem
                                 onClick={() =>
                                   updateUserRole.mutate({
                                     userId: user.user_id,
                                     role: "admin",
                                     action: "remove",
                                   })
                                 }
                               >
                                 <Shield className="h-4 w-4 mr-2" />
                                 Retirer Admin
                               </DropdownMenuItem>
                             )}
                             {user.platform_role !== "moderator" && user.platform_role !== "admin" && (
                               <DropdownMenuItem
                                 onClick={() =>
                                   updateUserRole.mutate({
                                     userId: user.user_id,
                                     role: "moderator",
                                     action: "add",
                                   })
                                 }
                               >
                                 <Shield className="h-4 w-4 mr-2" />
                                 Promouvoir Modérateur
                               </DropdownMenuItem>
                             )}
                             {user.platform_role === "moderator" && (
                               <DropdownMenuItem
                                 onClick={() =>
                                   updateUserRole.mutate({
                                     userId: user.user_id,
                                     role: "moderator",
                                     action: "remove",
                                   })
                                 }
                               >
                                 <Shield className="h-4 w-4 mr-2" />
                                 Retirer Modérateur
                               </DropdownMenuItem>
                             )}
                             <DropdownMenuSeparator />
                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                 <DropdownMenuItem
                                   onSelect={(e) => e.preventDefault()}
                                   className="text-destructive"
                                 >
                                   <Trash2 className="h-4 w-4 mr-2" />
                                   Supprimer
                                 </DropdownMenuItem>
                               </AlertDialogTrigger>
                               <AlertDialogContent>
                                 <AlertDialogHeader>
                                   <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
                                   <AlertDialogDescription>
                                     Cette action supprimera définitivement l'utilisateur "
                                     {user.full_name || user.username}" et toutes ses données.
                                   </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel>Annuler</AlertDialogCancel>
                                   <AlertDialogAction
                                     onClick={() => deleteUser.mutate(user.id)}
                                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                   >
                                     Supprimer
                                   </AlertDialogAction>
                                 </AlertDialogFooter>
                               </AlertDialogContent>
                             </AlertDialog>
                           </DropdownMenuContent>
                         </DropdownMenu>
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