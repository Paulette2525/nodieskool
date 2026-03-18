import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContactAdmin } from "@/hooks/useMessages";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityContext } from "@/contexts/CommunityContext";

export function ContactAdminButton() {
  const { slug } = useParams<{ slug: string }>();
  const { profile } = useAuth();
  const { community, isOwner } = useCommunityContext();
  const { startConversation } = useContactAdmin();
  const navigate = useNavigate();

  if (!profile || isOwner || !community) return null;

  const handleContact = () => {
    startConversation.mutate(undefined, {
      onSuccess: (conversationId) => {
        navigate(`/c/${slug}/messages?conv=${conversationId}`);
      },
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleContact}
      disabled={startConversation.isPending}
      className="w-full justify-start text-sidebar-foreground text-xs h-8 rounded-lg"
    >
      {startConversation.isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
      ) : (
        <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
      )}
      <span className="ml-2">Contacter l'admin</span>
    </Button>
  );
}
