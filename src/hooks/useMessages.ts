import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { toast } from "sonner";

export function useContactAdmin() {
  const { profile } = useAuth();
  const { community } = useCommunityContext();
  const queryClient = useQueryClient();

  const startConversation = useMutation({
    mutationFn: async () => {
      if (!profile || !community) throw new Error("Not authenticated");

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
