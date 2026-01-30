import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar communityName="Growth Academy" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
