import { EventCard } from "@/components/community/EventCard";
import { Card } from "@/components/ui/card";
import { Loader2, Calendar } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";

export default function CommunityEvents() {
  const { upcomingEvents, pastEvents, isLoading, registeredEventIds, toggleRegistration } = useEvents();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Événements</h1>

      {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
        <Card className="p-10 text-center rounded-2xl border-border/50">
          <Calendar className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm font-medium">Aucun événement pour le moment</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {upcomingEvents.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">À venir</h2>
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} isRegistered={registeredEventIds.has(event.id)} onToggleRegistration={() => toggleRegistration.mutate(event.id)} />
              ))}
            </div>
          )}
          {pastEvents.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Passés</h2>
              {pastEvents.map(event => (
                <EventCard key={event.id} event={event} isRegistered={registeredEventIds.has(event.id)} onToggleRegistration={() => toggleRegistration.mutate(event.id)} isPast />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
