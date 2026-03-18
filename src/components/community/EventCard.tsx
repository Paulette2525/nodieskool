import { Calendar, Clock, Users, Video, MapPin, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CommunityEvent } from "@/hooks/useEvents";

interface EventCardProps {
  event: CommunityEvent;
  isRegistered: boolean;
  onToggleRegistration: () => void;
  isPast?: boolean;
}

export function EventCard({ event, isRegistered, onToggleRegistration, isPast }: EventCardProps) {
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);

  const typeLabel = event.event_type === "live" ? "En direct" : event.event_type === "workshop" ? "Atelier" : event.event_type;

  return (
    <Card className={cn("p-5 rounded-2xl border-border/50 transition-all duration-200", isPast && "opacity-60")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs rounded-lg">
              {event.event_type === "live" ? <Video className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
              {typeLabel}
            </Badge>
            <Badge variant="outline" className="text-xs rounded-lg">
              <Users className="h-3 w-3 mr-1" />
              {event.attendees_count} inscrit{event.attendees_count > 1 ? "s" : ""}
            </Badge>
          </div>
          
          <h3 className="font-semibold text-foreground text-sm mb-1">{event.title}</h3>
          {event.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(startDate, "d MMM yyyy", { locale: fr })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {format(startDate, "HH:mm", { locale: fr })} - {format(endDate, "HH:mm", { locale: fr })}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          {!isPast && (
            <Button
              size="sm"
              variant={isRegistered ? "outline" : "default"}
              onClick={onToggleRegistration}
              className="rounded-xl text-xs"
            >
              {isRegistered ? "Se désinscrire" : "S'inscrire"}
            </Button>
          )}
          {event.meeting_url && isRegistered && !isPast && (
            <Button size="sm" variant="ghost" asChild className="rounded-xl text-xs">
              <a href={event.meeting_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Rejoindre
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
