import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContactAdmin } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { toast } from "sonner";

export function ContactAdminButton() {
  const { profile } = useAuth();
  const { community, isOwner } = useCommunityContext();
  const { startConversation } = useContactAdmin();

  if (!profile || isOwner || !community) return null;

  const handleContact = () => {
    startConversation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Conversation créée avec l'administrateur !");
      },
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleContact}
      disabled={startConversation.isPending}
      className="w-full justify-start gap-2.5 text-[13px] font-medium h-9 rounded-xl border-primary/20 text-primary hover:bg-primary/10 hover:text-primary"
    >
      {startConversation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
      ) : (
        <MessageSquare className="h-4 w-4 flex-shrink-0" />
      )}
      Contacter l'admin
    </Button>
  );
}
