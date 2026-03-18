import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Conversation {
  id: string;
  community_id: string;
  created_at: string;
  updated_at: string;
  other_user: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export function useCommunityMessages(communityId: string | null, ownerId: string | null) {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const isOwner = profile?.id === ownerId;

  // Fetch all conversations for this community (admin sees all, member sees own)
  const fetchConversations = useCallback(async () => {
    if (!communityId || !profile) return;
    setLoading(true);

    try {
      // Get conversations for this community where current user is a participant
      const { data: participations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", profile.id);

      if (!participations?.length) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const convIds = participations.map(p => p.conversation_id);

      const { data: convs } = await supabase
        .from("conversations")
        .select("*")
        .in("id", convIds)
        .eq("community_id", communityId)
        .order("updated_at", { ascending: false });

      if (!convs?.length) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // For each conversation, get the other participant's profile and last message
      const enriched: Conversation[] = await Promise.all(
        convs.map(async (conv) => {
          // Get other participant
          const { data: participants } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.id)
            .neq("user_id", profile.id);

          const otherId = participants?.[0]?.user_id;
          let otherUser = { id: "", username: "Utilisateur", full_name: null as string | null, avatar_url: null as string | null };

          if (otherId) {
            const { data: p } = await supabase
              .from("profiles")
              .select("id, username, full_name, avatar_url")
              .eq("id", otherId)
              .single();
            if (p) otherUser = p;
          }

          // Get last message
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, created_at, sender_id")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Count unread
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("is_read", false)
            .neq("sender_id", profile.id);

          return {
            id: conv.id,
            community_id: communityId,
            created_at: conv.created_at || "",
            updated_at: conv.updated_at || "",
            other_user: otherUser,
            last_message: lastMsg || undefined,
            unread_count: count || 0,
          };
        })
      );

      setConversations(enriched);
    } catch (e) {
      console.error("Error fetching conversations:", e);
    }
    setLoading(false);
  }, [communityId, profile?.id]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages((data as Message[]) || []);
    setMessagesLoading(false);

    // Mark as read
    if (profile) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", profile.id)
        .eq("is_read", false);
    }
  }, [profile?.id]);

  // Open a conversation
  const openConversation = useCallback(async (conversationId: string) => {
    setActiveConversationId(conversationId);
    await fetchMessages(conversationId);
  }, [fetchMessages]);

  // Create or find existing conversation between member and owner
  const getOrCreateConversation = useCallback(async (): Promise<string | null> => {
    if (!communityId || !profile || !ownerId) return null;

    // Find existing conversation in this community between these two users
    const { data: myParticipations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", profile.id);

    if (myParticipations?.length) {
      const convIds = myParticipations.map(p => p.conversation_id);

      const { data: communityConvs } = await supabase
        .from("conversations")
        .select("id")
        .in("id", convIds)
        .eq("community_id", communityId);

      if (communityConvs?.length) {
        for (const conv of communityConvs) {
          const { data: otherParticipant } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.id)
            .eq("user_id", ownerId)
            .single();

          if (otherParticipant) return conv.id;
        }
      }
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({ community_id: communityId })
      .select()
      .single();

    if (error || !newConv) return null;

    // Add both participants
    await supabase.from("conversation_participants").insert([
      { conversation_id: newConv.id, user_id: profile.id },
      { conversation_id: newConv.id, user_id: ownerId },
    ]);

    return newConv.id;
  }, [communityId, profile?.id, ownerId]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!activeConversationId || !profile || !content.trim()) return;

    const { data } = await supabase
      .from("messages")
      .insert({
        conversation_id: activeConversationId,
        sender_id: profile.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (data) {
      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeConversationId);
    }
  }, [activeConversationId, profile?.id]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!activeConversationId) return;

    const channel = supabase
      .channel(`messages-${activeConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);

          // Mark as read if not our message
          if (profile && newMsg.sender_id !== profile.id) {
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, profile?.id]);

  // Initial load
  useEffect(() => {
    if (communityId && profile) {
      fetchConversations();
    }
  }, [communityId, profile?.id]);

  return {
    conversations,
    messages,
    activeConversationId,
    loading,
    messagesLoading,
    isOwner,
    openConversation,
    getOrCreateConversation,
    sendMessage,
    fetchConversations,
    setActiveConversationId,
  };
}
