import { useState, useRef, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
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
import { Camera, Loader2, MessageSquare, Heart, BookOpen, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const { updateProfile } = useProfile();
  const { uploadAvatar, uploading } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({ full_name: "", username: "", bio: "" });

  useEffect(() => {
    if (profile) setFormData({ full_name: profile.full_name || "", username: profile.username || "", bio: profile.bio || "" });
  }, [profile]);

  const { data: stats } = useQuery({
    queryKey: ["user-stats", profile?.id],
    queryFn: async () => {
      if (!profile) return null;
      const [p, c, l, pr] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact" }).eq("user_id", profile.id),
        supabase.from("post_comments").select("id", { count: "exact" }).eq("user_id", profile.id),
        supabase.from("post_likes").select("id", { count: "exact" }).eq("user_id", profile.id),
        supabase.from("lesson_progress").select("id", { count: "exact" }).eq("user_id", profile.id),
      ]);
      return { posts: p.count || 0, comments: c.count || 0, likes: l.count || 0, lessonsCompleted: pr.count || 0 };
    },
    enabled: !!profile,
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await uploadAvatar(file); if (url) await updateProfile.mutateAsync({ avatar_url: url });
  };

  return (
    <AppLayout title="Mon Profil">
      <div className="max-w-2xl mx-auto py-6 px-4">
        <Card className="mb-5 rounded-2xl border-border/50 shadow-card">
          <CardContent className="pt-5">
            <div className="flex flex-col md:flex-row items-center gap-5">
              <div className="relative group">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {(profile?.full_name || profile?.username || "U").split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" disabled={uploading}>
                  {uploading ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-lg font-bold">{profile?.full_name || profile?.username}</h1>
                <p className="text-xs text-muted-foreground">@{profile?.username}</p>
                {profile?.bio && <p className="mt-1.5 text-xs text-muted-foreground">{profile.bio}</p>}
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-xl text-xs h-8">
                <Link to="/settings"><Settings className="h-3.5 w-3.5 mr-1.5" />Paramètres</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="stats" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 rounded-xl h-9">
            <TabsTrigger value="stats" className="text-xs rounded-lg">Statistiques</TabsTrigger>
            <TabsTrigger value="edit" className="text-xs rounded-lg">Modifier</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Publications", value: stats?.posts || 0, icon: MessageSquare, color: "text-primary" },
                { label: "Commentaires", value: stats?.comments || 0, icon: MessageSquare, color: "text-blue-500" },
                { label: "Likes", value: stats?.likes || 0, icon: Heart, color: "text-red-500" },
                { label: "Leçons", value: stats?.lessonsCompleted || 0, icon: BookOpen, color: "text-success" },
              ].map((s) => (
                <Card key={s.label} className="rounded-2xl border-border/50 shadow-card">
                  <CardHeader className="pb-1.5 pt-4 px-4">
                    <CardDescription className="text-[10px]">{s.label}</CardDescription>
                    <CardTitle className="text-2xl flex items-center gap-1.5">
                      <s.icon className={`h-4 w-4 ${s.color}`} />{s.value}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="edit">
            <Card className="rounded-2xl border-border/50 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Modifier le profil</CardTitle>
                <CardDescription className="text-xs">Mettez à jour vos informations</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={async (e) => { e.preventDefault(); await updateProfile.mutateAsync(formData); }} className="space-y-3">
                  <div className="space-y-1.5"><Label htmlFor="full_name" className="text-xs">Nom complet</Label><Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="rounded-xl h-9 text-sm" /></div>
                  <div className="space-y-1.5"><Label htmlFor="username" className="text-xs">Nom d'utilisateur</Label><Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="rounded-xl h-9 text-sm" /></div>
                  <div className="space-y-1.5"><Label htmlFor="bio" className="text-xs">Bio</Label><Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} className="rounded-xl text-sm" /></div>
                  <Button type="submit" disabled={updateProfile.isPending} className="rounded-xl text-xs h-9">
                    {updateProfile.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}Enregistrer
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
