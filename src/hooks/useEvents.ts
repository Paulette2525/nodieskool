import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string;
  meeting_url: string | null;
  host_id: string | null;
  attendees_count: number;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useEvents() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .gte("end_time", new Date().toISOString())
        .order("start_time");

      if (error) throw error;
      return data as Event[];
    },
  });

  const attendeesQuery = useQuery({
    queryKey: ["event-attendees", profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data, error } = await supabase
        .from("event_attendees")
        .select("event_id")
        .eq("user_id", profile.id);

      if (error) throw error;
      return data.map((a) => a.event_id);
    },
    enabled: !!profile,
  });

  const registerForEvent = useMutation({
    mutationFn: async (eventId: string) => {
      if (!profile) throw new Error("Not authenticated");

      const { error } = await supabase.from("event_attendees").insert({
        event_id: eventId,
        user_id: profile.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event-attendees"] });
      toast.success("Registered for event!");
    },
    onError: (error) => {
      toast.error("Failed to register: " + error.message);
    },
  });

  const unregisterFromEvent = useMutation({
    mutationFn: async (eventId: string) => {
      if (!profile) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("event_attendees")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", profile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event-attendees"] });
      toast.success("Unregistered from event");
    },
  });

  const createEvent = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      event_type: string;
      start_time: string;
      end_time: string;
      meeting_url?: string;
    }) => {
      if (!profile) throw new Error("Not authenticated");

      const { error } = await supabase.from("events").insert({
        ...data,
        host_id: profile.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created!");
    },
    onError: (error) => {
      toast.error("Failed to create event: " + error.message);
    },
  });

  return {
    events: eventsQuery.data ?? [],
    registeredEvents: attendeesQuery.data ?? [],
    isLoading: eventsQuery.isLoading,
    registerForEvent,
    unregisterFromEvent,
    createEvent,
  };
}
