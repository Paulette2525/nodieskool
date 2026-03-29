import { ReactNode, lazy, Suspense, useState } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const GlobalSearch = lazy(() => import("@/components/search/GlobalSearch").then(m => ({ default: m.GlobalSearch })));
const NotificationBell = lazy(() => import("@/components/notifications/NotificationBell").then(m => ({ default: m.NotificationBell })));

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-2.5 flex md:hidden items-center justify-between gap-3 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <img src={collonieLogoImg} alt="Collonie" className="h-7 object-contain flex-1" />
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
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
