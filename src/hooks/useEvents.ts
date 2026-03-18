import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { toast } from "sonner";

export interface CommunityEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string;
  meeting_url: string | null;
  attendees_count: number;
  community_id: string | null;
  host_id: string | null;
  created_at: string;
}

export function useEvents() {
  const { communityId } = useCommunityContext();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ["events", communityId],
    queryFn: async () => {
      if (!communityId) return [];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("community_id", communityId)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data as CommunityEvent[];
    },
    enabled: !!communityId,
  });

  const userRegistrationsQuery = useQuery({
    queryKey: ["event-registrations", communityId, profile?.id],
    queryFn: async () => {
      if (!profile || !communityId) return new Set<string>();
      const eventIds = (eventsQuery.data ?? []).map(e => e.id);
      if (eventIds.length === 0) return new Set<string>();
      const { data, error } = await supabase
        .from("event_attendees")
        .select("event_id")
        .eq("user_id", profile.id)
        .in("event_id", eventIds);
      if (error) throw error;
      return new Set(data.map(d => d.event_id));
    },
    enabled: !!profile && (eventsQuery.data?.length ?? 0) > 0,
  });

  const createEvent = useMutation({
    mutationFn: async (event: { title: string; description?: string; event_type: string; start_time: string; end_time: string; meeting_url?: string }) => {
      if (!profile || !communityId) throw new Error("Not authenticated");
      const { error } = await supabase.from("events").insert({
        ...event,
        community_id: communityId,
        host_id: profile.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", communityId] });
      toast.success("Événement créé !");
    },
    onError: (error) => toast.error("Erreur : " + error.message),
  });

  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", communityId] });
      toast.success("Événement supprimé !");
    },
    onError: (error) => toast.error("Erreur : " + error.message),
  });

  const toggleRegistration = useMutation({
    mutationFn: async (eventId: string) => {
      if (!profile) throw new Error("Not authenticated");
      const isRegistered = userRegistrationsQuery.data?.has(eventId);
      if (isRegistered) {
        const { error } = await supabase.from("event_attendees").delete().eq("event_id", eventId).eq("user_id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("event_attendees").insert({ event_id: eventId, user_id: profile.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", communityId] });
      queryClient.invalidateQueries({ queryKey: ["event-registrations", communityId] });
    },
    onError: (error) => toast.error("Erreur : " + error.message),
  });

  const now = new Date().toISOString();
  const allEvents = eventsQuery.data ?? [];

  return {
    upcomingEvents: allEvents.filter(e => e.end_time >= now),
    pastEvents: allEvents.filter(e => e.end_time < now),
    isLoading: eventsQuery.isLoading,
    registeredEventIds: userRegistrationsQuery.data ?? new Set<string>(),
    createEvent,
    deleteEvent,
    toggleRegistration,
  };
}
