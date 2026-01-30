import { MainLayout } from "@/components/layout/MainLayout";
import { LeaderboardCard } from "@/components/leaderboard/LeaderboardCard";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Flame, Calendar } from "lucide-react";

// Mock data
const mockLeaderboard = [
  { rank: 1, name: "David Kim", avatar: "", points: 2450, level: 5, trend: 'stable' as const },
  { rank: 2, name: "Sarah Johnson", avatar: "", points: 2180, level: 4, trend: 'up' as const },
  { rank: 3, name: "Alex Martinez", avatar: "", points: 1890, level: 4, trend: 'up' as const },
  { rank: 4, name: "Emily Rodriguez", avatar: "", points: 1650, level: 3, trend: 'down' as const },
  { rank: 5, name: "John Doe", avatar: "", points: 1250, level: 3, trend: 'up' as const, isCurrentUser: true },
  { rank: 6, name: "Michael Chen", avatar: "", points: 1180, level: 2, trend: 'stable' as const },
  { rank: 7, name: "Lisa Wang", avatar: "", points: 980, level: 2, trend: 'up' as const },
  { rank: 8, name: "Tom Wilson", avatar: "", points: 850, level: 2, trend: 'down' as const },
  { rank: 9, name: "Anna Brown", avatar: "", points: 720, level: 1, trend: 'up' as const },
  { rank: 10, name: "Chris Lee", avatar: "", points: 650, level: 1, trend: 'stable' as const },
];

const pointsBreakdown = [
  { action: "Complete a lesson", points: "+10" },
  { action: "Post in community", points: "+5" },
  { action: "Comment on a post", points: "+2" },
  { action: "Receive a like", points: "+1" },
  { action: "Complete a course", points: "+50" },
];

export default function Leaderboard() {
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
                <TabsTrigger value="monthly" className="gap-1.5">
                  <Calendar className="h-4 w-4" />
                  This Month
                </TabsTrigger>
                <TabsTrigger value="weekly" className="gap-1.5">
                  <Flame className="h-4 w-4" />
                  This Week
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all-time" className="space-y-3">
                {mockLeaderboard.map((entry) => (
                  <LeaderboardCard
                    key={entry.rank}
                    rank={entry.rank}
                    name={entry.name}
                    avatar={entry.avatar}
                    points={entry.points}
                    level={entry.level}
                    trend={entry.trend}
                    isCurrentUser={entry.isCurrentUser}
                  />
                ))}
              </TabsContent>

              <TabsContent value="monthly" className="space-y-3">
                {mockLeaderboard.slice().sort(() => Math.random() - 0.5).map((entry, idx) => (
                  <LeaderboardCard
                    key={entry.name}
                    rank={idx + 1}
                    name={entry.name}
                    avatar={entry.avatar}
                    points={Math.round(entry.points * 0.3)}
                    level={entry.level}
                    trend={entry.trend}
                    isCurrentUser={entry.isCurrentUser}
                  />
                ))}
              </TabsContent>

              <TabsContent value="weekly" className="space-y-3">
                {mockLeaderboard.slice().sort(() => Math.random() - 0.5).map((entry, idx) => (
                  <LeaderboardCard
                    key={entry.name}
                    rank={idx + 1}
                    name={entry.name}
                    avatar={entry.avatar}
                    points={Math.round(entry.points * 0.1)}
                    level={entry.level}
                    trend={entry.trend}
                    isCurrentUser={entry.isCurrentUser}
                  />
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Your Stats */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-3xl font-bold text-primary">#5</p>
                  <p className="text-sm text-muted-foreground">Current Rank</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-xl font-bold text-foreground">1,250</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-xl font-bold text-foreground">3</p>
                    <p className="text-xs text-muted-foreground">Level</p>
                  </div>
                </div>
              </div>
            </Card>

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
