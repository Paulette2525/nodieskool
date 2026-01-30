import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { LeaderboardCard } from "@/components/leaderboard/LeaderboardCard";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Flame, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLeaderboard } from "@/hooks/useLeaderboard";

const pointsBreakdown = [
  { action: "Complete a lesson", points: "+10" },
  { action: "Post in community", points: "+5" },
  { action: "Comment on a post", points: "+2" },
  { action: "Receive a like", points: "+1" },
];

export default function Leaderboard() {
  const { user, profile, loading } = useAuth();
  const { data: leaderboard, isLoading } = useLeaderboard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const currentUserRank = leaderboard?.findIndex((entry) => entry.id === profile?.id) ?? -1;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">See how you rank among the community</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main leaderboard */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="all-time" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all-time" className="gap-1.5">
                  <Trophy className="h-4 w-4" />
                  All Time
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all-time" className="space-y-3">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : leaderboard && leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => (
                    <LeaderboardCard
                      key={entry.id}
                      rank={index + 1}
                      name={entry.full_name || entry.username}
                      avatar={entry.avatar_url ?? undefined}
                      points={entry.points}
                      level={entry.level}
                      trend="stable"
                      isCurrentUser={entry.id === profile?.id}
                    />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No members yet</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Your Stats */}
            {profile && (
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-4">Your Stats</h3>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-3xl font-bold text-primary">
                      #{currentUserRank >= 0 ? currentUserRank + 1 : "-"}
                    </p>
                    <p className="text-sm text-muted-foreground">Current Rank</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-xl font-bold text-foreground">{profile.points}</p>
                      <p className="text-xs text-muted-foreground">Points</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-xl font-bold text-foreground">{profile.level}</p>
                      <p className="text-xs text-muted-foreground">Level</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* How to Earn Points */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-4">How to Earn Points</h3>
              <div className="space-y-2">
                {pointsBreakdown.map((item) => (
                  <div key={item.action} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.action}</span>
                    <span className="font-medium text-success">{item.points}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
