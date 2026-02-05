 import { ReactNode, useEffect } from "react";
 import { Navigate } from "react-router-dom";
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
   const { community, loading, isMember, isOwner } = useCommunityContext();
   const { user, loading: authLoading } = useAuth();
 
   if (loading || authLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (!community) {
     return <Navigate to="/dashboard" replace />;
   }
 
   // If user is not a member, show the preview page
   if (!isMember) {
     return <CommunityPreview />;
   }
 
   return (
     <div className="flex min-h-screen w-full bg-background">
       <CommunitySidebar />
       <main className="flex-1 overflow-auto w-full md:w-auto">
         {user && (
           <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b px-4 py-3 hidden md:flex items-center justify-between gap-4">
             <GlobalSearch />
             <NotificationBell />
           </div>
         )}
         <div className="pt-16 md:pt-0">
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