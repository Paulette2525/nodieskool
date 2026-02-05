 import { CommunityLayout } from "@/components/layout/CommunityLayout";
 import { LeaderboardCard } from "@/components/leaderboard/LeaderboardCard";
 import { Loader2 } from "lucide-react";
 import { useAuth } from "@/hooks/useAuth";
 import { useLeaderboard } from "@/hooks/useLeaderboard";
 import { useCommunityContext } from "@/contexts/CommunityContext";
 
 function CommunityLeaderboardContent() {
   const { profile } = useAuth();
   const { community } = useCommunityContext();
   const { data: leaderboard, isLoading } = useLeaderboard(community?.id);
 
   return (
     <div className="max-w-4xl mx-auto p-6">
       <div className="mb-6">
         <h1 className="text-2xl font-bold text-foreground">Classement</h1>
         <p className="text-muted-foreground mt-1">
           Les membres les plus actifs de la communauté
         </p>
       </div>
 
       {isLoading ? (
         <div className="flex justify-center py-12">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       ) : (
         <div className="space-y-3">
           {leaderboard?.map((member, index) => (
             <LeaderboardCard
               key={member.id}
               rank={index + 1}
               name={member.full_name || member.username}
               avatar={member.avatar_url || undefined}
               level={member.level}
               points={member.points}
               trend="stable"
               isCurrentUser={profile?.id === member.id}
             />
           ))}
         </div>
       )}
     </div>
   );
 }
 
 export default function CommunityLeaderboard() {
   return (
     <CommunityLayout>
       <CommunityLeaderboardContent />
     </CommunityLayout>
   );
 }