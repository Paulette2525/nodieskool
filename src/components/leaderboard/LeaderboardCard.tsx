import { TrendingUp, TrendingDown, Minus, Crown, Medal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LeaderboardCardProps {
  rank: number;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  trend: 'up' | 'down' | 'stable';
  isCurrentUser?: boolean;
}

export function LeaderboardCard({
  rank,
  name,
  avatar,
  points,
  level,
  trend,
  isCurrentUser,
}: LeaderboardCardProps) {
  const getRankDisplay = () => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100">
          <Crown className="h-4 w-4 text-amber-600" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
          <Medal className="h-4 w-4 text-gray-500" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
          <Medal className="h-4 w-4 text-orange-600" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 text-muted-foreground font-medium">
        {rank}
      </div>
    );
  };

  const getTrendIcon = () => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-success" />;
    }
    if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getLevelColor = (lvl: number) => {
    const colors = [
      "bg-gray-100 text-gray-700",
      "bg-emerald-100 text-emerald-700",
      "bg-blue-100 text-blue-700",
      "bg-purple-100 text-purple-700",
      "bg-amber-100 text-amber-700",
    ];
    return colors[Math.min(lvl - 1, colors.length - 1)] || colors[0];
  };

  return (
    <Card className={cn(
      "p-4 transition-all hover:shadow-md",
      isCurrentUser && "ring-2 ring-primary bg-primary/5",
      rank <= 3 && "shadow-card"
    )}>
      <div className="flex items-center gap-4">
        {/* Rank */}
        {getRankDisplay()}

        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        {/* Name & Level */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-medium truncate",
              isCurrentUser && "text-primary"
            )}>
              {name}
            </span>
            {isCurrentUser && (
              <span className="text-xs text-primary font-medium">(You)</span>
            )}
          </div>
          <span className={cn(
            "inline-block px-1.5 py-0.5 rounded text-[10px] font-medium mt-0.5",
            getLevelColor(level)
          )}>
            Level {level}
          </span>
        </div>

        {/* Points */}
        <div className="text-right">
          <div className="font-semibold text-foreground">{points.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">points</div>
        </div>

        {/* Trend */}
        <div className="flex items-center justify-center w-8">
          {getTrendIcon()}
        </div>
      </div>
    </Card>
  );
}
