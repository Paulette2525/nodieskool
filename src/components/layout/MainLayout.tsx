import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/hooks/useAuth";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar communityName="Growth Academy" />
      <main className="flex-1 overflow-auto w-full md:w-auto">
        {/* Top bar with search and notifications */}
        {user && (
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b px-4 py-3 hidden md:flex items-center justify-between gap-4">
            <GlobalSearch />
            <NotificationBell />
          </div>
        )}
        {/* Add padding top on mobile to account for the menu button */}
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
