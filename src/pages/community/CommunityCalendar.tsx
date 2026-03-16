import { useState } from "react";
import { CommunityLayout } from "@/components/layout/CommunityLayout";
import { EventCard } from "@/components/calendar/EventCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Calendar, Plus } from "lucide-react";
import { useEventsWithCommunity } from "@/hooks/useEvents";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

function CommunityCalendarContent() {
  const { profile } = useAuth();
  const { community, isAdmin } = useCommunityContext();
  const { events, registeredEvents, isLoading, registerForEvent, unregisterFromEvent } = useEventsWithCommunity(community?.id);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("live");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !community) return;
    setCreating(true);
    try {
      const { error } = await supabase.from("events").insert({
        title,
        description,
        event_type: eventType,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        meeting_url: meetingUrl || null,
        host_id: profile.id,
        community_id: community.id,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Événement créé avec succès !");
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setMeetingUrl("");
      setOpen(false);
    } catch (error: any) {
      toast.error("Erreur : " + error.message);
    } finally {
      setCreating(false);
    }
  };

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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel événement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un événement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Masterclass design" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Détails de l'événement..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="masterclass">Masterclass</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="qa">Q&A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Début</Label>
                    <Input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Fin</Label>
                    <Input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Lien de la réunion (optionnel)</Label>
                  <Input value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} placeholder="https://meet.google.com/..." />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer l'événement
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
