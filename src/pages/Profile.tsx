import { useState, useRef } from "react";
import { Navigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStorage } from "@/hooks/useStorage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Camera, Loader2, MessageSquare, Heart, BookOpen, Trophy, Settings, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const { updateProfile } = useProfile();
  const { uploadAvatar, uploading } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form when profile loads
  useState(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
      });
    }
  });

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ["user-stats", profile?.id],
    queryFn: async () => {
      if (!profile) return null;

      const [postsRes, commentsRes, likesRes, progressRes] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact" }).eq("user_id", profile.id),
        supabase.from("post_comments").select("id", { count: "exact" }).eq("user_id", profile.id),
        supabase.from("post_likes").select("id", { count: "exact" }).eq("user_id", profile.id),
        supabase.from("lesson_progress").select("id", { count: "exact" }).eq("user_id", profile.id),
      ]);

      return {
        posts: postsRes.count || 0,
        comments: commentsRes.count || 0,
        likes: likesRes.count || 0,
        lessonsCompleted: progressRes.count || 0,
      };
    },
    enabled: !!profile,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadAvatar(file);
    if (url) {
      await updateProfile.mutateAsync({ avatar_url: url });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync(formData);
    setIsEditing(false);
  };

  const levelProgress = profile ? (profile.points % 100) : 0;
  const pointsToNextLevel = 100 - levelProgress;

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8 px-4">
        {/* Back button */}
        <Link to="/community" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Retour à la communauté
        </Link>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {(profile?.full_name || profile?.username || "U").split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{profile?.full_name || profile?.username}</h1>
                <p className="text-muted-foreground">@{profile?.username}</p>
                {profile?.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres
                  </Link>
                </Button>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Niveau {profile?.level}</span>
                </div>
                <span className="text-sm text-muted-foreground">{profile?.points} points</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {pointsToNextLevel} points pour atteindre le niveau {(profile?.level || 1) + 1}
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="edit">Modifier le profil</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Publications</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    {stats?.posts || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Commentaires</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    {stats?.comments || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Likes donnés</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    {stats?.likes || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Leçons terminées</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-500" />
                    {stats?.lessonsCompleted || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="edit">
            <Card>
              <CardHeader>
                <CardTitle>Modifier le profil</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nom complet</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="votre_username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Parlez-nous de vous..."
                      rows={4}
                    />
                  </div>
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer les modifications
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
