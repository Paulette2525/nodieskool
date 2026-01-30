import { useState } from "react";
import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { usePosts } from "@/hooks/usePosts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, BookOpen, Calendar, FileText, Settings, BarChart3 } from "lucide-react";

import { AdminStats } from "@/components/admin/AdminStats";
import { AdminMembersTab } from "@/components/admin/AdminMembersTab";
import { AdminCoursesTab } from "@/components/admin/AdminCoursesTab";
import { AdminEventsTab } from "@/components/admin/AdminEventsTab";
import { AdminPostsTab } from "@/components/admin/AdminPostsTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const { members, stats, awardPoints, updateUserRole, isLoading } = useAdmin();
  const { posts, deletePost } = usePosts();

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

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Tableau de Bord Admin</h1>
          <p className="text-muted-foreground mt-1">Gérez votre communauté</p>
        </div>

        {/* Stats */}
        <AdminStats stats={stats} />

        {/* Tabs */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              Membres
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Formations
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="h-4 w-4" />
              Événements
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <FileText className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members">
            <AdminMembersTab
              members={members}
              awardPoints={awardPoints}
              updateUserRole={updateUserRole}
            />
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <AdminCoursesTab />
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <AdminEventsTab />
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <AdminPostsTab posts={posts} deletePost={deletePost} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <AdminSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
