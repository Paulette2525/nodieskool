 import { CommunityLayout } from "@/components/layout/CommunityLayout";
 import { EventCard } from "@/components/calendar/EventCard";
 import { Card } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Loader2, Calendar, Plus } from "lucide-react";
 import { useAuth } from "@/hooks/useAuth";
 import { useEventsWithCommunity } from "@/hooks/useEvents";
 import { useCommunityContext } from "@/contexts/CommunityContext";
 
 function CommunityCalendarContent() {
   const { profile } = useAuth();
   const { community, isAdmin } = useCommunityContext();
   const { events, registeredEvents, isLoading, registerForEvent, unregisterFromEvent } = useEventsWithCommunity(community?.id);
 
   return (
     <div className="max-w-4xl mx-auto p-6">
       <div className="flex items-center justify-between mb-6">
         <div>
           <h1 className="text-2xl font-bold text-foreground">Calendrier</h1>
           <p className="text-muted-foreground mt-1">
             Événements et sessions à venir
           </p>
         </div>
         {isAdmin && (
           <Button>
             <Plus className="h-4 w-4 mr-2" />
             Nouvel événement
           </Button>
         )}
       </div>
 
       {isLoading ? (
         <div className="flex justify-center py-12">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       ) : events.length === 0 ? (
         <Card className="p-12 text-center">
           <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
             <Calendar className="h-8 w-8 text-muted-foreground" />
           </div>
           <h3 className="text-lg font-semibold mb-2">Aucun événement prévu</h3>
           <p className="text-muted-foreground">
             Restez à l'écoute pour les prochains événements
           </p>
         </Card>
       ) : (
         <div className="space-y-4">
           {events.map((event) => (
             <EventCard
               key={event.id}
               id={event.id}
               title={event.title}
               description={event.description || ""}
               type={event.event_type as "live" | "masterclass" | "workshop" | "qa"}
               startTime={new Date(event.start_time)}
               endTime={new Date(event.end_time)}
               hostName={event.profiles?.full_name || event.profiles?.username || "Host"}
               hostAvatar={event.profiles?.avatar_url || undefined}
               attendeesCount={event.attendees_count}
               isRegistered={registeredEvents.includes(event.id)}
               onJoin={() => {
                 if (registeredEvents.includes(event.id)) {
                   unregisterFromEvent.mutate(event.id);
                 } else {
                   registerForEvent.mutate(event.id);
                 }
               }}
             />
           ))}
         </div>
       )}
     </div>
   );
 }
 
 export default function CommunityCalendar() {
   return (
     <CommunityLayout>
       <CommunityCalendarContent />
     </CommunityLayout>
   );
 }