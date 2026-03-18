import { Navigate } from "react-router-dom";
import { CommunityLayout } from "@/components/layout/CommunityLayout";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useCommunityAdmin } from "@/hooks/useCommunityAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, BookOpen, FileText, Settings, Calendar } from "lucide-react";

import { CommunityAdminStats } from "@/components/community-admin/CommunityAdminStats";
import { CommunityAdminMembersTab } from "@/components/community-admin/CommunityAdminMembersTab";
import { CommunityAdminCoursesTab } from "@/components/community-admin/CommunityAdminCoursesTab";
import { CommunityAdminPostsTab } from "@/components/community-admin/CommunityAdminPostsTab";
import { CommunityAdminSettingsTab } from "@/components/community-admin/CommunityAdminSettingsTab";
import { CommunityAdminEventsTab } from "@/components/community-admin/CommunityAdminEventsTab";

function CommunityAdminContent() {
  const { community, isAdmin, loading: contextLoading } = useCommunityContext();
  const { 
    members, 
    stats, 
    courses, 
    posts, 
    isLoading,
    updateMemberRole,
    removeMember,
    deletePost,
  } = useCommunityAdmin();

  if (contextLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to={`/c/${community?.slug}/community`} replace />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Administration</h1>
        <p className="text-muted-foreground">
          Gérez votre communauté {community?.name}
        </p>
      </div>

      <CommunityAdminStats stats={stats} />

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
          <TabsTrigger value="posts" className="gap-2">
            <FileText className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <CommunityAdminMembersTab
            members={members}
            updateMemberRole={updateMemberRole}
            removeMember={removeMember}
          />
        </TabsContent>

        <TabsContent value="courses">
          <CommunityAdminCoursesTab courses={courses} />
        </TabsContent>

        <TabsContent value="posts">
          <CommunityAdminPostsTab posts={posts} deletePost={deletePost} />
        </TabsContent>

        <TabsContent value="settings">
          <CommunityAdminSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CommunityAdmin() {
  return (
    <CommunityLayout>
      <CommunityAdminContent />
    </CommunityLayout>
  );
}
