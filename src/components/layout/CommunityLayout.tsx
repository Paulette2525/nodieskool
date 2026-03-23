import { ReactNode, lazy, Suspense, useState } from "react";
import { Loader2, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { CommunitySidebar } from "./CommunitySidebar";
import { CommunityPreview } from "@/pages/community/CommunityPreview";
import { ProfileOnboarding } from "@/components/community/ProfileOnboarding";
import { Button } from "@/components/ui/button";

const GlobalSearch = lazy(() => import("@/components/search/GlobalSearch").then(m => ({ default: m.GlobalSearch })));
const NotificationBell = lazy(() => import("@/components/notifications/NotificationBell").then(m => ({ default: m.NotificationBell })));

interface CommunityLayoutProps {
  children: ReactNode;
}

function isProfileIncomplete(profile: any): boolean {
  return !profile?.avatar_url || !profile?.bio || !profile?.username;
}

export function CommunityLayout({ children }: CommunityLayoutProps) {
  const { community, loading, isMember } = useCommunityContext();
  const { user, profile, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Communauté introuvable</h1>
          <p className="text-sm text-muted-foreground">Cette communauté n'existe pas ou a été supprimée.</p>
        </div>
      </div>
    );
  }

  if (!isMember) return <CommunityPreview />;

  if (isMember && isProfileIncomplete(profile)) {
    return <ProfileOnboarding />;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <CommunitySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-2.5 flex md:hidden items-center justify-between gap-3 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {community.logo_url && (
              <img src={community.logo_url} alt="" className="h-6 w-6 rounded-full object-cover flex-shrink-0" />
            )}
            <span className="font-semibold text-sm text-foreground truncate">{community.name}</span>
          </div>
          {user && (
            <Suspense fallback={<div className="h-9 w-9" />}>
              <NotificationBell />
            </Suspense>
          )}
        </div>

        {user && (
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-2.5 hidden md:flex items-center justify-between gap-4 flex-shrink-0">
            <Suspense fallback={<div className="h-9" />}>
              <GlobalSearch />
            </Suspense>
            <Suspense fallback={<div className="h-9 w-9" />}>
              <NotificationBell />
            </Suspense>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
