import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityItem } from "@/hooks/useSuperAdmin";
import { BookOpen, ClipboardCheck, CalendarCheck, Filter } from "lucide-react";

interface SuperAdminActivityProps {
  activity: ActivityItem[];
}

const typeConfig = {
  lesson: { icon: BookOpen, label: "Leçon", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  quiz: { icon: ClipboardCheck, label: "Quiz", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  event_register: { icon: CalendarCheck, label: "Événement", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
};

type FilterType = "all" | ActivityItem["type"];

export function SuperAdminActivity({ activity }: SuperAdminActivityProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = filter === "all" ? activity : activity.filter((a) => a.type === filter);

  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "Tout" },
    { value: "points", label: "Points" },
    { value: "lesson", label: "Leçons" },
    { value: "quiz", label: "Quiz" },
    { value: "event_register", label: "Événements" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {filters.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activité récente ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune activité trouvée</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filtered.map((item) => {
                const config = typeConfig[item.type];
                const Icon = config.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.user_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{item.detail}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
