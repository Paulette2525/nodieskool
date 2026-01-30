import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: {
    id: string;
    user_id: string;
    profile: {
      id: string;
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  }[];
  last_message?: Message;
  unread_count: number;
}

export function useMessages(conversationId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ["conversations", profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data, error } = await supabase
        .from("conversation_participants")
        .select(`
          conversation_id,
          conversations!inner(id, created_at, updated_at)
        `)
        .eq("user_id", profile.id);

      if (error) throw error;

      // Get full conversation details for each
      const conversationIds = data.map((d: any) => d.conversation_id);
      
      if (conversationIds.length === 0) return [];

      // Get participants for each conversation
      const { data: allParticipants, error: partError } = await supabase
        .from("conversation_participants")
        .select(`
          id,
          conversation_id,
          user_id,
          profile:profiles(id, username, full_name, avatar_url)
        `)
        .in("conversation_id", conversationIds);

      if (partError) throw partError;

      // Get last message for each conversation
      const { data: lastMessages, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false });

      if (msgError) throw msgError;

      // Get unread counts
      const { data: unreadCounts, error: unreadError } = await supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", conversationIds)
        .neq("sender_id", profile.id)
        .eq("is_read", false);

      if (unreadError) throw unreadError;

      // Build conversation objects
      const conversationsMap = new Map<string, Conversation>();
      
      data.forEach((d: any) => {
        const conv = d.conversations;
        const participants = allParticipants
          ?.filter((p: any) => p.conversation_id === conv.id)
          .map((p: any) => ({
            id: p.id,
            user_id: p.user_id,
            profile: p.profile,
          })) || [];

        const lastMsg = lastMessages?.find((m) => m.conversation_id === conv.id);
        const unreadCount = unreadCounts?.filter((u) => u.conversation_id === conv.id).length || 0;

        conversationsMap.set(conv.id, {
          ...conv,
          participants,
          last_message: lastMsg,
          unread_count: unreadCount,
        });
      });

      return Array.from(conversationsMap.values()).sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    },
    enabled: !!profile,
  });

  // Fetch messages for a specific conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles(id, username, full_name, avatar_url)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  // Send a message
  const sendMessage = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!profile) throw new Error("Must be logged in");

      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: profile.id,
        content,
      });

      if (error) throw error;

      // Update conversation updated_at
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Create a new conversation
  const createConversation = useMutation({
    mutationFn: async (participantIds: string[]) => {
      if (!profile) throw new Error("Must be logged in");

      // Create conversation
      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      // Add participants (including current user)
      const allParticipants = [...new Set([profile.id, ...participantIds])];
      
      const { error: partError } = await supabase
        .from("conversation_participants")
        .insert(
          allParticipants.map((userId) => ({
            conversation_id: conv.id,
            user_id: userId,
          }))
        );

      if (partError) throw partError;

      return conv.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Mark messages as read
  const markAsRead = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!profile) return;

      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", profile.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    conversations,
    messages,
    loadingConversations,
    loadingMessages,
    sendMessage,
    createConversation,
    markAsRead,
  };
}
