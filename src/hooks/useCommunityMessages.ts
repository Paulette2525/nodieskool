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
  const [error, setError] = useState<string | null>(null);

  const isOwner = profile?.id === ownerId;

  // Fetch all conversations for this community
  const fetchConversations = useCallback(async () => {
    if (!communityId || !profile) return;
    setLoading(true);

    try {
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

      const activeConvIds = convs.map(c => c.id);

      // Batch: get all participants for all conversations at once
      const { data: allParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", convIds)
        .neq("user_id", profile.id);

      const otherUserIds = [...new Set((allParticipants || []).map(p => p.user_id))];

      // Batch: get all other user profiles at once
      let profilesMap: Record<string, { id: string; username: string; full_name: string | null; avatar_url: string | null }> = {};
      if (otherUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", otherUserIds);
        for (const p of profiles || []) {
          profilesMap[p.id] = p;
        }
      }

      // Batch: get last message + unread count for all conversations
      const [lastMsgsResult, unreadResult] = await Promise.all([
        supabase
          .from("messages")
          .select("conversation_id, content, created_at, sender_id")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("messages")
          .select("conversation_id", { count: "exact" })
          .in("conversation_id", convIds)
          .eq("is_read", false)
          .neq("sender_id", profile.id),
      ]);

      // Build last message map (first occurrence per conversation_id = most recent)
      const lastMsgMap: Record<string, { content: string; created_at: string; sender_id: string }> = {};
      for (const msg of lastMsgsResult.data || []) {
        if (!lastMsgMap[msg.conversation_id]) {
          lastMsgMap[msg.conversation_id] = msg;
        }
      }

      // Build unread count map
      const unreadMap: Record<string, number> = {};
      for (const msg of unreadResult.data || []) {
        unreadMap[msg.conversation_id] = (unreadMap[msg.conversation_id] || 0) + 1;
      }

      // Build participant map: conversation_id -> other user id
      const participantMap: Record<string, string> = {};
      for (const p of allParticipants || []) {
        participantMap[p.conversation_id] = p.user_id;
      }

      const enriched: Conversation[] = convs.map((conv) => {
        const otherId = participantMap[conv.id];
        const otherUser = otherId && profilesMap[otherId]
          ? profilesMap[otherId]
          : { id: "", username: "Utilisateur", full_name: null, avatar_url: null };

        return {
          id: conv.id,
          community_id: communityId!,
          created_at: conv.created_at || "",
          updated_at: conv.updated_at || "",
          other_user: otherUser,
          last_message: lastMsgMap[conv.id] || undefined,
          unread_count: unreadMap[conv.id] || 0,
        };
      });

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

  // Create or find existing conversation via backend RPC
  const getOrCreateConversation = useCallback(async (): Promise<string | null> => {
    if (!communityId || !profile) return null;
    setError(null);

    try {
      const { data, error: rpcError } = await supabase
        .rpc("get_or_create_admin_conversation", { _community_id: communityId });

      if (rpcError) {
        console.error("RPC error:", rpcError);
        setError("Impossible de démarrer la conversation.");
        return null;
      }

      return data as string;
    } catch (e) {
      console.error("Error creating conversation:", e);
      setError("Impossible de démarrer la conversation.");
      return null;
    }
  }, [communityId, profile?.id]);

  // Send a message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!activeConversationId || !profile || !content.trim()) return false;

    const { error: sendError } = await supabase
      .from("messages")
      .insert({
        conversation_id: activeConversationId,
        sender_id: profile.id,
        content: content.trim(),
      });

    if (sendError) {
      console.error("Send error:", sendError);
      return false;
    }

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", activeConversationId);

    return true;
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

  // Realtime for new conversations (admin inbox refresh)
  useEffect(() => {
    if (!communityId || !profile || !isOwner) return;

    const channel = supabase
      .channel(`conv-participants-${communityId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_participants",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId, profile?.id, isOwner, fetchConversations]);

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
    error,
    isOwner,
    openConversation,
    getOrCreateConversation,
    sendMessage,
    fetchConversations,
    setActiveConversationId,
  };
}
