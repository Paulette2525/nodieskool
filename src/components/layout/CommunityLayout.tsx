import { ReactNode, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { CommunityProvider, useCommunityContext } from "@/contexts/CommunityContext";
import { CommunitySidebar } from "./CommunitySidebar";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { CommunityPreview } from "@/pages/community/CommunityPreview";
import { ProfileOnboarding, hasSkippedOnboarding } from "@/components/community/ProfileOnboarding";

interface CommunityLayoutProps {
  children: ReactNode;
}

function isProfileIncomplete(profile: any): boolean {
  return !profile?.avatar_url || !profile?.bio;
}

function CommunityLayoutInner({ children }: CommunityLayoutProps) {
  const { community, loading, isMember } = useCommunityContext();
  const { user, profile, loading: authLoading } = useAuth();
  const [skipped, setSkipped] = useState(hasSkippedOnboarding());

  useEffect(() => {
    const handler = () => setSkipped(hasSkippedOnboarding());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

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

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <CommunitySidebar />
      <main className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">
        {user && (
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-2.5 hidden md:flex items-center justify-between gap-4 flex-shrink-0">
            <GlobalSearch />
            <NotificationBell />
          </div>
        )}
        <div className="flex-1 overflow-auto pt-14 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}

export function CommunityLayout({ children }: CommunityLayoutProps) {
  return (
    <CommunityProvider>
      <CommunityLayoutInner>{children}</CommunityLayoutInner>
    </CommunityProvider>
  );
}
