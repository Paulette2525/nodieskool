 import { useState } from "react";
 import { useNavigate, useLocation } from "react-router-dom";
 import { Users, Lock, Globe, Loader2 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent } from "@/components/ui/card";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Badge } from "@/components/ui/badge";
 import { useCommunityContext } from "@/contexts/CommunityContext";
 import { useAuth } from "@/hooks/useAuth";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import { saveRedirectUrl } from "@/hooks/useRedirectUrl";
import { useQueryClient } from "@tanstack/react-query";
 
 export function CommunityPreview() {
   const { community, memberCount, refetch } = useCommunityContext();
   const { user, profile } = useAuth();
   const navigate = useNavigate();
   const location = useLocation();
   const [joining, setJoining] = useState(false);
  const queryClient = useQueryClient();
 
   if (!community) return null;
 
   const handleJoinCommunity = async () => {
     if (!profile) return;
 
     setJoining(true);
     try {
       const { error } = await supabase
         .from("community_members")
         .insert({
           community_id: community.id,
           user_id: profile.id,
           role: "member",
           is_approved: community.is_public,
         });
 
       if (error) throw error;
      
      // Invalidate queries to refresh membership data
      await queryClient.invalidateQueries({ queryKey: ["community"] });
 
        toast.success(
          community.is_public
            ? "Bienvenue dans la communauté !"
            : "Demande d'adhésion envoyée !"
        );

        // Refresh community context to update membership status
        refetch();
     } catch (error: any) {
       console.error("Error joining community:", error);
       toast.error("Erreur lors de l'adhésion à la communauté");
     } finally {
       setJoining(false);
     }
   };
 
   const handleLoginToJoin = () => {
     // Save current URL for redirect after login
     saveRedirectUrl(location.pathname);
     navigate("/auth");
   };
 
   return (
     <div className="min-h-screen bg-background">
       {/* Cover Image */}
       <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/10">
         {community.cover_url && (
           <img
             src={community.cover_url}
             alt={`${community.name} cover`}
             className="w-full h-full object-cover"
           />
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
       </div>
 
       {/* Community Info */}
       <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
         <Card className="border-0 shadow-lg">
           <CardContent className="pt-6">
             {/* Logo and Name */}
             <div className="flex items-start gap-4 mb-6">
               <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                 {community.logo_url ? (
                   <AvatarImage src={community.logo_url} alt={community.name} />
                 ) : (
                   <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                     {community.name.charAt(0).toUpperCase()}
                   </AvatarFallback>
                 )}
               </Avatar>
               <div className="flex-1 min-w-0">
                 <h1 className="text-2xl font-bold truncate">{community.name}</h1>
                 <p className="text-muted-foreground">@{community.slug}</p>
               </div>
             </div>
 
             {/* Description */}
             {community.description && (
               <p className="text-muted-foreground mb-6 leading-relaxed">
                 {community.description}
               </p>
             )}
 
             {/* Stats */}
             <div className="flex items-center gap-4 mb-6">
               <div className="flex items-center gap-2 text-muted-foreground">
                 <Users className="h-4 w-4" />
                 <span className="font-medium">{memberCount}</span>
                 <span>membre{memberCount !== 1 ? "s" : ""}</span>
               </div>
               <Badge variant={community.is_public ? "secondary" : "outline"}>
                 {community.is_public ? (
                   <>
                     <Globe className="h-3 w-3 mr-1" />
                     Public
                   </>
                 ) : (
                   <>
                     <Lock className="h-3 w-3 mr-1" />
                     Privé
                   </>
                 )}
               </Badge>
             </div>
 
             {/* Action Button */}
             {user ? (
               <Button
                 onClick={handleJoinCommunity}
                 disabled={joining}
                 className="w-full"
                 size="lg"
               >
                 {joining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 {community.is_public
                   ? "Rejoindre la communauté"
                   : "Demander à rejoindre"}
               </Button>
             ) : (
               <Button
                 onClick={handleLoginToJoin}
                 className="w-full"
                 size="lg"
               >
                 Se connecter pour rejoindre
               </Button>
             )}
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }