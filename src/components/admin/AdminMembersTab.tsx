import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Award,
  Shield,
  ShieldCheck,
  Crown,
  Loader2,
  MoreHorizontal,
  UserX,
  Edit,
  History,
} from "lucide-react";
import { format } from "date-fns";
import { UseMutationResult } from "@tanstack/react-query";

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
  awardPoints: UseMutationResult<void, Error, { userId: string; points: number; reason: string }>;
  updateUserRole: UseMutationResult<void, Error, { userId: string; role: "admin" | "moderator" | "member"; action: "add" | "remove" }>;
}

export function AdminMembersTab({ members, awardPoints, updateUserRole }: AdminMembersTabProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsReason, setPointsReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAwardPoints = () => {
    if (!selectedMember || !pointsAmount || !pointsReason) return;

    awardPoints.mutate(
      {
        userId: selectedMember,
        points: parseInt(pointsAmount),
        reason: pointsReason,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setPointsAmount("");
          setPointsReason("");
          setSelectedMember(null);
        },
      }
    );
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
        <div className="flex items-center gap-2">
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Award className="h-4 w-4" />
                Attribuer Points
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Attribuer des Points</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Sélectionner un membre</Label>
                  <Select value={selectedMember ?? ""} onValueChange={setSelectedMember}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un membre" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name || member.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={pointsAmount}
                    onChange={(e) => setPointsAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Raison</Label>
                  <Input
                    placeholder="Récompense spéciale"
                    value={pointsReason}
                    onChange={(e) => setPointsReason(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleAwardPoints}
                  disabled={awardPoints.isPending}
                >
                  {awardPoints.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Attribuer Points
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membre</TableHead>
              <TableHead>Rôles</TableHead>
              <TableHead>Niveau</TableHead>
              <TableHead>Points</TableHead>
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
                <TableCell>
                  <Badge variant="outline">Lvl {member.level}</Badge>
                </TableCell>
                <TableCell className="font-medium">{member.points}</TableCell>
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
                      <DropdownMenuItem onClick={() => {
                        setSelectedMember(member.id);
                        setDialogOpen(true);
                      }}>
                        <Award className="mr-2 h-4 w-4" />
                        Attribuer des points
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier le profil
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <History className="mr-2 h-4 w-4" />
                        Historique des points
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
                      <DropdownMenuItem className="text-destructive">
                        <UserX className="mr-2 h-4 w-4" />
                        Bannir l'utilisateur
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
