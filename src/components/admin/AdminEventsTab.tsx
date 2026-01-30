import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  Users,
  Video,
  Mic,
  MessageSquare,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  event_type: string;
  meeting_url: string | null;
  attendees_count: number;
  host_id: string | null;
  created_at: string;
}

const eventTypes = [
  { value: "live", label: "Live", icon: Video },
  { value: "workshop", label: "Atelier", icon: Mic },
  { value: "qa", label: "Q&A", icon: MessageSquare },
];

export function AdminEventsTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [attendeesDialogOpen, setAttendeesDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    event_type: "live",
    meeting_url: "",
  });

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: false });
      if (error) throw error;
      return data as Event[];
    },
  });

  // Fetch attendees for selected event
  const { data: attendees = [] } = useQuery({
    queryKey: ["event-attendees", selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return [];
      const { data, error } = await supabase
        .from("event_attendees")
        .select(`
          id,
          registered_at,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("event_id", selectedEventId);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedEventId,
  });

  const saveEvent = useMutation({
    mutationFn: async (event: typeof eventForm & { id?: string }) => {
      if (event.id) {
        const { error } = await supabase
          .from("events")
          .update({
            title: event.title,
            description: event.description || null,
            start_time: event.start_time,
            end_time: event.end_time,
            event_type: event.event_type,
            meeting_url: event.meeting_url || null,
          })
          .eq("id", event.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert({
          title: event.title,
          description: event.description || null,
          start_time: event.start_time,
          end_time: event.end_time,
          event_type: event.event_type,
          meeting_url: event.meeting_url || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setDialogOpen(false);
      setEditingEvent(null);
      resetForm();
      toast.success("Événement enregistré");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Événement supprimé");
    },
  });

  const resetForm = () => {
    setEventForm({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      event_type: "live",
      meeting_url: "",
    });
  };

  const openEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || "",
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time.slice(0, 16),
      event_type: event.event_type,
      meeting_url: event.meeting_url || "",
    });
    setDialogOpen(true);
  };

  const openAttendees = (eventId: string) => {
    setSelectedEventId(eventId);
    setAttendeesDialogOpen(true);
  };

  const getEventTypeIcon = (type: string) => {
    const eventType = eventTypes.find((t) => t.value === type);
    if (!eventType) return <Calendar className="h-4 w-4" />;
    const Icon = eventType.icon;
    return <Icon className="h-4 w-4" />;
  };

  const getEventTypeBadge = (type: string) => {
    const eventType = eventTypes.find((t) => t.value === type);
    const colors: Record<string, string> = {
      live: "bg-red-100 text-red-700",
      workshop: "bg-blue-100 text-blue-700",
      qa: "bg-green-100 text-green-700",
    };
    return (
      <Badge className={`gap-1 ${colors[type] || "bg-gray-100 text-gray-700"}`}>
        {getEventTypeIcon(type)}
        {eventType?.label || type}
      </Badge>
    );
  };

  const isUpcoming = (date: string) => new Date(date) > new Date();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Gestion des Événements ({events.length})
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                setEditingEvent(null);
                resetForm();
              }}
            >
              <Plus className="h-4 w-4" />
              Nouvel Événement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Modifier l'Événement" : "Nouvel Événement"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Titre *</Label>
                <Input
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Live Q&A avec l'équipe"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Décrivez cet événement..."
                />
              </div>
              <div className="space-y-2">
                <Label>Type d'événement</Label>
                <Select
                  value={eventForm.event_type}
                  onValueChange={(value) => setEventForm({ ...eventForm, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date & heure de début *</Label>
                  <Input
                    type="datetime-local"
                    value={eventForm.start_time}
                    onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date & heure de fin *</Label>
                  <Input
                    type="datetime-local"
                    value={eventForm.end_time}
                    onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Lien de réunion (Zoom, Meet, etc.)</Label>
                <Input
                  value={eventForm.meeting_url}
                  onChange={(e) => setEventForm({ ...eventForm, meeting_url: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              <Button
                className="w-full"
                onClick={() => saveEvent.mutate({ ...eventForm, id: editingEvent?.id })}
                disabled={saveEvent.isPending || !eventForm.title || !eventForm.start_time || !eventForm.end_time}
              >
                {saveEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingEvent ? "Mettre à jour" : "Créer l'événement"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun événement. Créez votre premier événement !
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Événement</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getEventTypeBadge(event.event_type)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(new Date(event.start_time), "dd MMM yyyy", { locale: fr })}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.start_time), "HH:mm")} - {format(new Date(event.end_time), "HH:mm")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => openAttendees(event.id)}
                    >
                      <Users className="h-4 w-4" />
                      {event.attendees_count}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {isUpcoming(event.start_time) ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        À venir
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Passé
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditEvent(event)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openAttendees(event.id)}>
                          <Users className="mr-2 h-4 w-4" />
                          Voir les participants
                        </DropdownMenuItem>
                        {event.meeting_url && (
                          <DropdownMenuItem asChild>
                            <a href={event.meeting_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Ouvrir le lien
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteEvent.mutate(event.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Attendees Dialog */}
        <Dialog open={attendeesDialogOpen} onOpenChange={setAttendeesDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Participants ({attendees.length})</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-auto">
              {attendees.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Aucun participant inscrit
                </p>
              ) : (
                <div className="space-y-2">
                  {attendees.map((attendee: any) => (
                    <div
                      key={attendee.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {(attendee.profiles?.full_name || attendee.profiles?.username || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {attendee.profiles?.full_name || attendee.profiles?.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Inscrit le {format(new Date(attendee.registered_at), "dd/MM/yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
