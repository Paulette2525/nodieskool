import { useState } from "react";
import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { usePosts } from "@/hooks/usePosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users,
  FileText,
  BookOpen,
  Calendar,
  Award,
  Trash2,
  Shield,
  ShieldCheck,
  Crown,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const { members, stats, awardPoints, updateUserRole, isLoading } = useAdmin();
  const { posts, deletePost } = usePosts();

  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsReason, setPointsReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/community" replace />;
  }

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
            Member
          </Badge>
        );
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your community</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.membersCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">Members</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-success/10">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.postsCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.coursesCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">Courses</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.eventsCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">Events</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Members</CardTitle>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Award className="h-4 w-4" />
                      Award Points
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Award Points to Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Select Member</Label>
                        <Select value={selectedMember ?? ""} onValueChange={setSelectedMember}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a member" />
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
                        <Label>Reason</Label>
                        <Input
                          placeholder="Achievement unlocked"
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
                        Award Points
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
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
                          {format(new Date(member.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!member.roles.includes("admin") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateUserRole.mutate({
                                    userId: member.user_id,
                                    role: member.roles.includes("moderator") ? "moderator" : "moderator",
                                    action: member.roles.includes("moderator") ? "remove" : "add",
                                  })
                                }
                              >
                                {member.roles.includes("moderator") ? "Remove Mod" : "Make Mod"}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Author</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.profiles?.avatar_url ?? undefined} />
                              <AvatarFallback className="text-xs">
                                {(post.profiles?.full_name || post.profiles?.username || "U")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {post.profiles?.full_name || post.profiles?.username}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{post.content}</TableCell>
                        <TableCell>{post.likes_count}</TableCell>
                        <TableCell>{post.comments_count}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(post.created_at), "MMM d")}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deletePost.mutate(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
