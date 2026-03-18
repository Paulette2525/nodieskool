import { ReactNode, lazy, Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";

const GlobalSearch = lazy(() => import("@/components/search/GlobalSearch").then(m => ({ default: m.GlobalSearch })));
const NotificationBell = lazy(() => import("@/components/notifications/NotificationBell").then(m => ({ default: m.NotificationBell })));

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">
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
        <div className="flex-1 overflow-auto pt-14 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
