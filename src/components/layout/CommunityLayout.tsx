 import { ReactNode, useEffect } from "react";
 import { useParams, Navigate, useLocation } from "react-router-dom";
 import { Loader2 } from "lucide-react";
 import { CommunityProvider, useCommunityContext } from "@/contexts/CommunityContext";
 import { CommunitySidebar } from "./CommunitySidebar";
 import { GlobalSearch } from "@/components/search/GlobalSearch";
 import { NotificationBell } from "@/components/notifications/NotificationBell";
 import { useAuth } from "@/hooks/useAuth";
 
 interface CommunityLayoutProps {
   children: ReactNode;
 }
 
 function CommunityLayoutInner({ children }: CommunityLayoutProps) {
   const { community, loading, isMember } = useCommunityContext();
   const { user, loading: authLoading } = useAuth();
   const location = useLocation();
 
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
 
   // If community is private and user is not a member, redirect
   if (!community.is_public && !isMember && user) {
     return <Navigate to="/dashboard" replace />;
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