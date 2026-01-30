import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar communityName="Growth Academy" />
      <main className="flex-1 overflow-auto w-full md:w-auto">
        {/* Add padding top on mobile to account for the menu button */}
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
