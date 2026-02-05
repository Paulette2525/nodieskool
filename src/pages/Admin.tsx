 import { useState } from "react";
 import { Navigate } from "react-router-dom";
 import { useAuth } from "@/hooks/useAuth";
 import { useSuperAdmin } from "@/hooks/useSuperAdmin";
 import { Button } from "@/components/ui/button";
 import { cn } from "@/lib/utils";
 import {
   Loader2,
   LayoutDashboard,
   Building2,
   Users,
   FileText,
   Settings,
   Shield,
   LogOut,
 } from "lucide-react";
 
 import { SuperAdminDashboard } from "@/components/super-admin/SuperAdminDashboard";
 import { SuperAdminCommunities } from "@/components/super-admin/SuperAdminCommunities";
 import { SuperAdminUsers } from "@/components/super-admin/SuperAdminUsers";
 import { SuperAdminContent } from "@/components/super-admin/SuperAdminContent";
 import { SuperAdminSettings } from "@/components/super-admin/SuperAdminSettings";
 
 type AdminSection = "dashboard" | "communities" | "users" | "content" | "settings";
 
 const navItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [
   { id: "dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
   { id: "communities", label: "Communautés", icon: Building2 },
   { id: "users", label: "Utilisateurs", icon: Users },
   { id: "content", label: "Contenu", icon: FileText },
   { id: "settings", label: "Paramètres", icon: Settings },
 ];
 
 export default function Admin() {
   const { isAdmin, loading, rolesLoaded, user, signOut } = useAuth();
   const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
   
   const {
     stats,
     users,
     communities,
     posts,
     isLoading,
     toggleCommunityActive,
     deleteCommunity,
     updateUserRole,
     deleteUser,
     deletePost,
   } = useSuperAdmin();
 
   // Wait for both auth loading AND roles to be loaded
   if (loading || !rolesLoaded) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <div className="flex flex-col items-center gap-3">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="text-sm text-muted-foreground">Chargement des permissions...</p>
         </div>
       </div>
     );
   }
 
   // If not logged in, redirect to auth
   if (!user) {
     return <Navigate to="/auth" replace />;
   }
 
   // If logged in but not admin, redirect to dashboard
   if (!isAdmin) {
     console.log("User is not admin, redirecting. isAdmin:", isAdmin);
     return <Navigate to="/dashboard" replace />;
   }
 
   const renderContent = () => {
     if (isLoading) {
       return (
         <div className="flex items-center justify-center h-64">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       );
     }
 
     switch (activeSection) {
       case "dashboard":
         return <SuperAdminDashboard stats={stats} communities={communities} users={users} />;
       case "communities":
         return (
           <SuperAdminCommunities
             communities={communities}
             toggleCommunityActive={toggleCommunityActive}
             deleteCommunity={deleteCommunity}
           />
         );
       case "users":
         return (
           <SuperAdminUsers
             users={users}
             updateUserRole={updateUserRole}
             deleteUser={deleteUser}
           />
         );
       case "content":
         return <SuperAdminContent posts={posts} deletePost={deletePost} />;
       case "settings":
         return <SuperAdminSettings />;
       default:
         return null;
     }
   };
 
   return (
     <div className="min-h-screen bg-muted/30 flex">
       {/* Sidebar */}
       <aside className="w-64 bg-card border-r flex flex-col">
         {/* Logo */}
         <div className="p-6 border-b">
           <div className="flex items-center gap-2">
             <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
               <Shield className="h-6 w-6 text-primary-foreground" />
             </div>
             <div>
               <h1 className="font-bold text-lg">Super Admin</h1>
               <p className="text-xs text-muted-foreground">Gestion Plateforme</p>
             </div>
           </div>
         </div>
 
         {/* Navigation */}
         <nav className="flex-1 p-4 space-y-1">
           {navItems.map((item) => (
             <Button
               key={item.id}
               variant={activeSection === item.id ? "secondary" : "ghost"}
               className={cn(
                 "w-full justify-start gap-3",
                 activeSection === item.id && "bg-primary/10 text-primary"
               )}
               onClick={() => setActiveSection(item.id)}
             >
               <item.icon className="h-4 w-4" />
               {item.label}
             </Button>
           ))}
         </nav>
 
         {/* Footer */}
         <div className="p-4 border-t">
           <Button
             variant="ghost"
             className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
             onClick={() => signOut()}
           >
             <LogOut className="h-4 w-4" />
             Déconnexion
           </Button>
           <Button
             variant="ghost"
             className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground mt-1"
             onClick={() => window.location.href = "/dashboard"}
           >
             <LayoutDashboard className="h-4 w-4" />
             Retour au site
           </Button>
         </div>
       </aside>
 
       {/* Main Content */}
       <main className="flex-1 overflow-auto">
         {/* Header */}
         <header className="bg-card border-b p-6">
           <h2 className="text-2xl font-bold">
             {navItems.find((i) => i.id === activeSection)?.label}
           </h2>
           <p className="text-muted-foreground">
             {activeSection === "dashboard" && "Vue d'ensemble de la plateforme"}
             {activeSection === "communities" && "Gérez toutes les communautés"}
             {activeSection === "users" && "Gérez tous les utilisateurs"}
             {activeSection === "content" && "Modérez le contenu de la plateforme"}
             {activeSection === "settings" && "Configurez la plateforme"}
           </p>
         </header>
 
         {/* Content */}
         <div className="p-6">{renderContent()}</div>
       </main>
     </div>
   );
 }
