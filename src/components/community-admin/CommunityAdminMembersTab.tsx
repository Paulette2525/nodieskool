 import { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
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
 } from "@/components/ui/alert-dialog";
 import {
   Shield,
   ShieldCheck,
   Crown,
   Loader2,
   MoreHorizontal,
   UserX,
   Users,
 } from "lucide-react";
 import { format } from "date-fns";
 import { CommunityMember } from "@/hooks/useCommunityAdmin";
 import { UseMutationResult } from "@tanstack/react-query";
 
 interface CommunityAdminMembersTabProps {
   members: CommunityMember[];
   updateMemberRole: UseMutationResult<void, Error, { memberId: string; role: "admin" | "moderator" | "member" }>;
   removeMember: UseMutationResult<void, Error, string>;
 }
 
 export function CommunityAdminMembersTab({ members, updateMemberRole, removeMember }: CommunityAdminMembersTabProps) {
   const [searchQuery, setSearchQuery] = useState("");
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [memberToDelete, setMemberToDelete] = useState<CommunityMember | null>(null);
 
   const handleRemoveMember = () => {
     if (!memberToDelete) return;
     removeMember.mutate(memberToDelete.id, {
       onSuccess: () => {
         setDeleteDialogOpen(false);
         setMemberToDelete(null);
       },
     });
   };
 
   const getRoleBadge = (role: string) => {
     switch (role) {
       case "owner":
         return (
           <Badge className="bg-amber-100 text-amber-700 gap-1">
             <Crown className="h-3 w-3" />
             Propriétaire
           </Badge>
         );
       case "admin":
         return (
           <Badge className="bg-red-100 text-red-700 gap-1">
             <ShieldCheck className="h-3 w-3" />
             Admin
           </Badge>
         );
       case "moderator":
         return (
           <Badge className="bg-purple-100 text-purple-700 gap-1">
             <ShieldCheck className="h-3 w-3" />
             Modérateur
           </Badge>
         );
       default:
         return (
           <Badge className="bg-gray-100 text-gray-700 gap-1">
             <Shield className="h-3 w-3" />
             Membre
           </Badge>
         );
     }
   };
 
   const filteredMembers = members.filter((member) =>
     (member.profile?.full_name || member.profile?.username || "")
       .toLowerCase()
       .includes(searchQuery.toLowerCase())
   );
 
   return (
     <Card>
       <CardHeader className="flex flex-row items-center justify-between gap-4">
         <CardTitle className="flex items-center gap-2">
           <Users className="h-5 w-5" />
           Membres ({members.length})
         </CardTitle>
         <Input
           placeholder="Rechercher..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-64"
         />
       </CardHeader>
       <CardContent>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Membre</TableHead>
               <TableHead>Rôle</TableHead>
               <TableHead>Niveau</TableHead>
               <TableHead>Points</TableHead>
               <TableHead>Rejoint le</TableHead>
               <TableHead className="text-right">Actions</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {filteredMembers.map((member) => (
               <TableRow key={member.id}>
                 <TableCell>
                   <div className="flex items-center gap-3">
                     <Avatar className="h-8 w-8">
                       <AvatarImage src={member.profile?.avatar_url ?? undefined} />
                       <AvatarFallback className="text-xs bg-primary/10 text-primary">
                         {(member.profile?.full_name || member.profile?.username || "?")
                           .split(" ")
                           .map((n) => n[0])
                           .join("")}
                       </AvatarFallback>
                     </Avatar>
                     <div>
                       <p className="font-medium">{member.profile?.full_name || member.profile?.username}</p>
                       <p className="text-xs text-muted-foreground">@{member.profile?.username}</p>
                     </div>
                   </div>
                 </TableCell>
                 <TableCell>{getRoleBadge(member.role)}</TableCell>
                 <TableCell>
                   <Badge variant="outline">Lvl {member.profile?.level ?? 1}</Badge>
                 </TableCell>
                 <TableCell className="font-medium">{member.profile?.points ?? 0}</TableCell>
                 <TableCell className="text-muted-foreground">
                   {format(new Date(member.joined_at), "dd/MM/yyyy")}
                 </TableCell>
                 <TableCell className="text-right">
                   {member.role !== "owner" && (
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon">
                           <MoreHorizontal className="h-4 w-4" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         {member.role !== "admin" && (
                           <DropdownMenuItem
                             onClick={() => updateMemberRole.mutate({ memberId: member.id, role: "admin" })}
                           >
                             <Crown className="mr-2 h-4 w-4" />
                             Promouvoir Admin
                           </DropdownMenuItem>
                         )}
                         {member.role !== "moderator" && (
                           <DropdownMenuItem
                             onClick={() => updateMemberRole.mutate({ memberId: member.id, role: "moderator" })}
                           >
                             <ShieldCheck className="mr-2 h-4 w-4" />
                             {member.role === "admin" ? "Rétrograder Modérateur" : "Promouvoir Modérateur"}
                           </DropdownMenuItem>
                         )}
                         {member.role !== "member" && (
                           <DropdownMenuItem
                             onClick={() => updateMemberRole.mutate({ memberId: member.id, role: "member" })}
                           >
                             <Shield className="mr-2 h-4 w-4" />
                             Rétrograder Membre
                           </DropdownMenuItem>
                         )}
                         <DropdownMenuSeparator />
                         <DropdownMenuItem
                           className="text-destructive"
                           onClick={() => {
                             setMemberToDelete(member);
                             setDeleteDialogOpen(true);
                           }}
                         >
                           <UserX className="mr-2 h-4 w-4" />
                           Retirer de la communauté
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   )}
                 </TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
       </CardContent>
 
       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Retirer ce membre ?</AlertDialogTitle>
             <AlertDialogDescription>
               Vous êtes sur le point de retirer{" "}
               <strong>{memberToDelete?.profile?.full_name || memberToDelete?.profile?.username}</strong>{" "}
               de la communauté. Cette personne pourra rejoindre à nouveau si la communauté est publique.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Annuler</AlertDialogCancel>
             <AlertDialogAction
               onClick={handleRemoveMember}
               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
             >
               {removeMember.isPending ? (
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               ) : null}
               Retirer
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </Card>
   );
 }