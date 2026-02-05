import { Navigate } from "react-router-dom";
 import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { usePosts } from "@/hooks/usePosts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, BookOpen, Calendar, FileText, Settings } from "lucide-react";

import { AdminStats } from "@/components/admin/AdminStats";
import { AdminMembersTab } from "@/components/admin/AdminMembersTab";
import { AdminCoursesTab } from "@/components/admin/AdminCoursesTab";
import { AdminEventsTab } from "@/components/admin/AdminEventsTab";
import { AdminPostsTab } from "@/components/admin/AdminPostsTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";

export default function Admin() {
  const { isAdmin, loading, rolesLoaded, user } = useAuth();
  const { members, stats, awardPoints, updateUserRole, deleteUser, isLoading } = useAdmin();
  const { posts, deletePost } = usePosts();

  // Wait for both auth loading AND roles to be loaded
  if (loading || !rolesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement des permissions...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If logged in but not admin, redirect to community
  if (!isAdmin) {
    console.log("User is not admin, redirecting. isAdmin:", isAdmin);
    return <Navigate to="/community" replace />;
  }

  return (
     <AppLayout title="Administration">
      <div className="max-w-6xl mx-auto p-6">
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
              deleteUser={deleteUser}
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
     </AppLayout>
  );
}
