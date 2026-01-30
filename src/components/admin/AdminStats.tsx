import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, BookOpen, Calendar, TrendingUp, Award } from "lucide-react";

interface AdminStatsProps {
  stats: {
    membersCount: number;
    postsCount: number;
    coursesCount: number;
    eventsCount: number;
  } | undefined;
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    {
      label: "Membres",
      value: stats?.membersCount ?? 0,
      icon: Users,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Posts",
      value: stats?.postsCount ?? 0,
      icon: FileText,
      bgColor: "bg-success/10",
      iconColor: "text-success",
    },
    {
      label: "Formations",
      value: stats?.coursesCount ?? 0,
      icon: BookOpen,
      bgColor: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      label: "Événements",
      value: stats?.eventsCount ?? 0,
      icon: Calendar,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
