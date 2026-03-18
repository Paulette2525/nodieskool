import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Plus, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEvents, type CommunityEvent } from "@/hooks/useEvents";

export function CommunityAdminEventsTab() {
  const { upcomingEvents, pastEvents, isLoading, createEvent, deleteEvent } = useEvents();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", event_type: "live", event_date: "", event_time: "", meeting_url: "" });

  const handleSubmit = () => {
    if (!form.title || !form.start_time || !form.end_time) return;
    createEvent.mutate({
      title: form.title,
      description: form.description || undefined,
      event_type: form.event_type,
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
      meeting_url: form.meeting_url || undefined,
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setForm({ title: "", description: "", event_type: "live", start_time: "", end_time: "", meeting_url: "" });
      },
    });
  };

  const allEvents = [...upcomingEvents, ...pastEvents];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Événements ({allEvents.length})</h2>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="rounded-xl gap-1.5">
          <Plus className="h-4 w-4" />
          Nouvel événement
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : allEvents.length === 0 ? (
        <Card className="p-8 text-center rounded-2xl border-border/50">
          <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Aucun événement</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {allEvents.map(event => (
            <Card key={event.id} className="p-4 rounded-xl flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(event.start_time), "d MMM yyyy HH:mm", { locale: fr })} · {event.attendees_count} inscrit(s)
                </p>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 flex-shrink-0" onClick={() => deleteEvent.mutate(event.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Nouvel événement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Titre de l'événement" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Description (optionnel)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="min-h-[80px]" />
            <Select value={form.event_type} onValueChange={v => setForm(f => ({ ...f, event_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="live">En direct</SelectItem>
                <SelectItem value="workshop">Atelier</SelectItem>
                <SelectItem value="meetup">Rencontre</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Début</label>
                <Input type="datetime-local" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Fin</label>
                <Input type="datetime-local" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>
            </div>
            <Input placeholder="Lien de la réunion (optionnel)" value={form.meeting_url} onChange={e => setForm(f => ({ ...f, meeting_url: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={!form.title || !form.start_time || !form.end_time || createEvent.isPending}>
              {createEvent.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
