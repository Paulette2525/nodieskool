import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { CommunityProvider, useCommunityContext } from "@/contexts/CommunityContext";
import { CommunitySidebar } from "./CommunitySidebar";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { CommunityPreview } from "@/pages/community/CommunityPreview";

interface CommunityLayoutProps {
  children: ReactNode;
}

function CommunityLayoutInner({ children }: CommunityLayoutProps) {
  const { community, loading, isMember } = useCommunityContext();
  const { user, loading: authLoading } = useAuth();

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
    <div className="flex min-h-screen w-full bg-background">
      <CommunitySidebar />
      <main className="flex-1 overflow-auto w-full md:w-auto">
        {user && (
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-2.5 hidden md:flex items-center justify-between gap-4">
            <GlobalSearch />
            <NotificationBell />
          </div>
        )}
        <div className="pt-14 md:pt-0">
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
