import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { toast } from "sonner";
import { useEffect } from "react";

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  }[];
  lastMessage?: Message;
}

export function useConversations() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: ["conversations", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      
      // Get conversations where user is participant
      const { data: participantData, error: pErr } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", profile.id);
      if (pErr) throw pErr;
      
      const convIds = participantData.map(p => p.conversation_id);
      if (convIds.length === 0) return [];

      // Get conversation details
      const { data: convos, error: cErr } = await supabase
        .from("conversations")
        .select("*")
        .in("id", convIds)
        .order("updated_at", { ascending: false });
      if (cErr) throw cErr;

      // Get all participants for these conversations
      const { data: allParticipants, error: apErr } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", convIds);
      if (apErr) throw apErr;

      // Get unique user ids (exclude self)
      const otherUserIds = [...new Set(allParticipants.filter(p => p.user_id !== profile.id).map(p => p.user_id))];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", otherUserIds);

      const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));

      // Get last message per conversation
      const { data: lastMessages } = await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false });

      const lastMsgMap = new Map<string, Message>();
      (lastMessages ?? []).forEach(msg => {
        if (!lastMsgMap.has(msg.conversation_id)) {
          lastMsgMap.set(msg.conversation_id, msg as Message);
        }
      });

      return convos.map(conv => ({
        id: conv.id,
        created_at: conv.created_at!,
        updated_at: conv.updated_at!,
        participants: allParticipants
          .filter(p => p.conversation_id === conv.id && p.user_id !== profile.id)
          .map(p => profileMap.get(p.user_id))
          .filter(Boolean) as Conversation["participants"],
        lastMessage: lastMsgMap.get(conv.id),
      })) as Conversation[];
    },
    enabled: !!profile,
  });

  return {
    conversations: conversationsQuery.data ?? [],
    isLoading: conversationsQuery.isLoading,
    refetch: conversationsQuery.refetch,
  };
}

export function useMessagesForConversation(conversationId: string | null) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!profile || !conversationId) throw new Error("Not authenticated");
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: profile.id,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => toast.error("Erreur : " + error.message),
  });

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    sendMessage,
  };
}

export function useContactAdmin() {
  const { profile } = useAuth();
  const { community } = useCommunityContext();
  const queryClient = useQueryClient();

  const startConversation = useMutation({
    mutationFn: async () => {
      if (!profile || !community) throw new Error("Not authenticated");

      // Get owner profile id
      const ownerId = community.owner_id;
      if (ownerId === profile.id) throw new Error("Vous êtes l'administrateur");

      // Check if conversation already exists between these two users
      const { data: myConvs } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", profile.id);

      if (myConvs && myConvs.length > 0) {
        const convIds = myConvs.map(c => c.conversation_id);
        const { data: ownerConvs } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", ownerId)
          .in("conversation_id", convIds);

        if (ownerConvs && ownerConvs.length > 0) {
          return ownerConvs[0].conversation_id;
        }
      }

      // Create new conversation
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .insert({})
        .select("id")
        .single();
      if (convErr) throw convErr;

      // Add both participants
      const { error: pErr } = await supabase.from("conversation_participants").insert([
        { conversation_id: conv.id, user_id: profile.id },
        { conversation_id: conv.id, user_id: ownerId },
      ]);
      if (pErr) throw pErr;

      return conv.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => toast.error("Erreur : " + error.message),
  });

  return { startConversation };
}
