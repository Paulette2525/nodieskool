 import { Navigate, Link, useLocation } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Card } from "@/components/ui/card";
 import { Loader2, Plus, Users, BookOpen, Trophy, Sparkles } from "lucide-react";
 import { useAuth } from "@/hooks/useAuth";
 import { useCommunities } from "@/hooks/useCommunities";
 import { useSubscription } from "@/hooks/useSubscription";
 import { CommunityCard } from "@/components/community/CommunityCard";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Badge } from "@/components/ui/badge";
 import { saveRedirectUrl } from "@/hooks/useRedirectUrl";
 
 export default function Dashboard() {
   const { user, profile, loading: authLoading } = useAuth();
   const { myCommunities, isLoading } = useCommunities();
   const { currentPlan, limits } = useSubscription();
    const location = useLocation();
 
   if (authLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (!user) {
      saveRedirectUrl(location.pathname + location.search + location.hash);
     return <Navigate to="/auth" replace />;
   }
 
   const canCreateMore = limits.maxCommunities === -1 || myCommunities.filter(c => c.role === "owner").length < limits.maxCommunities;
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="border-b bg-card">
         <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
           <Link to="/" className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
               <Sparkles className="h-5 w-5 text-primary-foreground" />
             </div>
             <span className="font-bold text-lg">Vibe Platform</span>
           </Link>
 
           <div className="flex items-center gap-4">
             <Badge variant="outline" className="capitalize">
               Plan {currentPlan}
             </Badge>
             <Link to="/profile">
               <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                 <AvatarImage src={profile?.avatar_url || undefined} />
                 <AvatarFallback className="bg-primary/10 text-primary text-sm">
                   {(profile?.full_name || profile?.username || "U").charAt(0)}
                 </AvatarFallback>
               </Avatar>
             </Link>
           </div>
         </div>
       </header>
 
       {/* Main content */}
       <main className="max-w-6xl mx-auto px-4 py-8">
         {/* Welcome section */}
         <div className="mb-8">
           <h1 className="text-3xl font-bold text-foreground">
             Bonjour, {profile?.full_name || profile?.username} 👋
           </h1>
           <p className="text-muted-foreground mt-1">
             Gérez vos communautés et découvrez de nouvelles opportunités
           </p>
         </div>
 
         {/* Stats cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <Card className="p-4 flex items-center gap-4">
             <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
               <Users className="h-6 w-6 text-primary" />
             </div>
             <div>
               <p className="text-2xl font-bold">{myCommunities.length}</p>
               <p className="text-sm text-muted-foreground">Communautés</p>
             </div>
           </Card>
           <Card className="p-4 flex items-center gap-4">
             <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
               <BookOpen className="h-6 w-6 text-accent" />
             </div>
             <div>
               <p className="text-2xl font-bold">{profile?.level || 1}</p>
               <p className="text-sm text-muted-foreground">Niveau</p>
             </div>
           </Card>
           <Card className="p-4 flex items-center gap-4">
             <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
               <Trophy className="h-6 w-6 text-primary" />
             </div>
             <div>
               <p className="text-2xl font-bold">{profile?.points || 0}</p>
               <p className="text-sm text-muted-foreground">Points</p>
             </div>
           </Card>
         </div>
 
         {/* Communities section */}
         <div className="flex items-center justify-between mb-4">
           <h2 className="text-xl font-semibold">Mes communautés</h2>
           {canCreateMore && (
             <Button asChild>
               <Link to="/create-community">
                 <Plus className="h-4 w-4 mr-2" />
                 Créer une communauté
               </Link>
             </Button>
           )}
         </div>
 
         {isLoading ? (
           <div className="flex justify-center py-12">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
         ) : myCommunities.length === 0 ? (
           <Card className="p-12 text-center">
             <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
               <Users className="h-8 w-8 text-muted-foreground" />
             </div>
             <h3 className="text-lg font-semibold mb-2">Aucune communauté</h3>
             <p className="text-muted-foreground mb-4">
               Créez votre première communauté ou rejoignez-en une existante
             </p>
             <div className="flex gap-3 justify-center">
               <Button asChild>
                 <Link to="/create-community">
                   <Plus className="h-4 w-4 mr-2" />
                   Créer une communauté
                 </Link>
               </Button>
               <Button variant="outline" asChild>
                 <Link to="/discover">
                   Découvrir
                 </Link>
               </Button>
             </div>
           </Card>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {myCommunities.map((community) => (
               <CommunityCard
                 key={community.id}
                 id={community.id}
                 name={community.name}
                 slug={community.slug}
                 description={community.description}
                 logoUrl={community.logo_url}
                 coverUrl={community.cover_url}
                 primaryColor={community.primary_color}
                 isPublic={community.is_public}
                 role={community.role}
               />
             ))}
           </div>
         )}
       </main>
     </div>
   );
 }