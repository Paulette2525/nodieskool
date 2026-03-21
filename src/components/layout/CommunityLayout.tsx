import { ReactNode, lazy, Suspense, useState } from "react";
import { Loader2, Settings, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { CommunitySidebar } from "./CommunitySidebar";
import { useAuth } from "@/hooks/useAuth";
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
  const { community, loading, isMember, isAdmin } = useCommunityContext();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
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
        {/* Mobile top bar */}
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
        {/* Desktop top bar */}
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
        {/* Community Banner */}
        <div className="relative w-full h-24 md:h-32 flex-shrink-0 overflow-hidden">
          {community.cover_url ? (
            <img
              src={community.cover_url}
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${community.primary_color || 'hsl(var(--primary))'}, ${community.primary_color || 'hsl(var(--primary))'}88)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-3">
            {community.logo_url && (
              <img
                src={community.logo_url}
                alt=""
                className="h-10 w-10 rounded-full border-2 border-white/80 object-cover"
              />
            )}
            <h2 className="text-white font-semibold text-lg drop-shadow-md">{community.name}</h2>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => navigate(`/c/${community.slug}/admin`)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
