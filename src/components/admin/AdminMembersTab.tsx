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
  Shield,
  ShieldCheck,
  Crown,
  Loader2,
  MoreHorizontal,
  UserX,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { UseMutationResult } from "@tanstack/react-query";
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

interface Member {
  id: string;
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  points: number;
  level: number;
  created_at: string;
  roles: string[];
}

interface AdminMembersTabProps {
  members: Member[];
  updateUserRole: UseMutationResult<void, Error, { userId: string; role: "admin" | "moderator" | "member"; action: "add" | "remove" }>;
  deleteUser: UseMutationResult<void, Error, string>;
}

export function AdminMembersTab({ members, updateUserRole, deleteUser }: AdminMembersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const handleDeleteUser = () => {
    if (!memberToDelete) return;
    deleteUser.mutate(memberToDelete.user_id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setMemberToDelete(null);
      },
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-amber-100 text-amber-700 gap-1">
            <Crown className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "moderator":
        return (
          <Badge className="bg-purple-100 text-purple-700 gap-1">
            <ShieldCheck className="h-3 w-3" />
            Mod
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
    (member.full_name || member.username)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Gestion des Membres ({members.length})</CardTitle>
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
              <TableHead>Rôles</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {(member.full_name || member.username)
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.full_name || member.username}</p>
                      <p className="text-xs text-muted-foreground">@{member.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {member.roles.map((role) => (
                      <span key={role}>{getRoleBadge(role)}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(member.created_at), "dd/MM/yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier le profil
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!member.roles.includes("admin") && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              updateUserRole.mutate({
                                userId: member.user_id,
                                role: "moderator",
                                action: member.roles.includes("moderator") ? "remove" : "add",
                              })
                            }
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            {member.roles.includes("moderator") ? "Retirer Modérateur" : "Promouvoir Modérateur"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateUserRole.mutate({
                                userId: member.user_id,
                                role: "admin",
                                action: "add",
                              })
                            }
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            Promouvoir Admin
                          </DropdownMenuItem>
                        </>
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
                        Supprimer l'utilisateur
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de supprimer{" "}
              <strong>{memberToDelete?.full_name || memberToDelete?.username}</strong>.
              Cette action est irréversible et supprimera toutes les données associées à cet utilisateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUser.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
