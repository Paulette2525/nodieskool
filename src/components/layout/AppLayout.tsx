 import { ReactNode } from "react";
 import { Link, useLocation } from "react-router-dom";
 import { GlobalSearch } from "@/components/search/GlobalSearch";
 import { NotificationBell } from "@/components/notifications/NotificationBell";
 import { useAuth } from "@/hooks/useAuth";
 import { Button } from "@/components/ui/button";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { 
   LayoutDashboard, 
   Settings, 
   LogOut, 
   ChevronLeft,
   Menu,
   X
 } from "lucide-react";
 import { useState } from "react";
 import { cn } from "@/lib/utils";
 
 interface AppLayoutProps {
   children: ReactNode;
   title?: string;
   showBackButton?: boolean;
   backTo?: string;
 }
 
 export function AppLayout({ children, title, showBackButton = true, backTo = "/dashboard" }: AppLayoutProps) {
   const { user, profile, signOut } = useAuth();
   const location = useLocation();
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
   const handleSignOut = async () => {
     await signOut();
   };
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-14 items-center gap-4 px-4">
           {/* Back button / Menu toggle */}
           {showBackButton && (
             <Button variant="ghost" size="icon" asChild className="hidden md:flex">
               <Link to={backTo}>
                 <ChevronLeft className="h-5 w-5" />
               </Link>
             </Button>
           )}
           
           <Button
             variant="ghost"
             size="icon"
             className="md:hidden"
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
           >
             {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
           </Button>
 
           {/* Title */}
           {title && (
             <h1 className="font-semibold text-lg">{title}</h1>
           )}
 
           {/* Spacer */}
           <div className="flex-1" />
 
           {/* Search & Notifications */}
           {user && (
             <div className="hidden md:flex items-center gap-4">
               <GlobalSearch />
               <NotificationBell />
             </div>
           )}
 
           {/* User Avatar */}
           {user && profile && (
             <Link to="/profile">
               <Avatar className="h-8 w-8">
                 <AvatarImage src={profile.avatar_url ?? undefined} />
                 <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                   {(profile.full_name || profile.username).split(' ').map(n => n[0]).join('')}
                 </AvatarFallback>
               </Avatar>
             </Link>
           )}
         </div>
 
         {/* Mobile menu */}
         {mobileMenuOpen && (
           <div className="border-t md:hidden">
             <nav className="container px-4 py-3 space-y-1">
               <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                 <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                   <LayoutDashboard className="h-4 w-4 mr-2" />
                   Dashboard
                 </Link>
               </Button>
               <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                 <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                   <Settings className="h-4 w-4 mr-2" />
                   Paramètres
                 </Link>
               </Button>
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="w-full justify-start text-destructive"
                 onClick={handleSignOut}
               >
                 <LogOut className="h-4 w-4 mr-2" />
                 Déconnexion
               </Button>
             </nav>
           </div>
         )}
       </header>
 
       {/* Main content */}
       <main>
         {children}
       </main>
     </div>
   );
 }