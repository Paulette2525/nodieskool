import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CommunityLayout } from "@/components/layout/CommunityLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, Send, ArrowLeft } from "lucide-react";
import { useConversations, useMessagesForConversation } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

function ConversationList({ onSelect, activeId }: { onSelect: (id: string) => void; activeId: string | null }) {
  const { conversations, isLoading } = useConversations();

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  }

  if (conversations.length === 0) {
    return (
      <Card className="p-8 text-center rounded-2xl border-border/50">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Aucune conversation</p>
      </Card>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map(conv => {
        const other = conv.participants[0];
        if (!other) return null;
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
              activeId === conv.id ? "bg-accent" : "hover:bg-accent/50"
            )}
          >
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={other.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {(other.full_name || other.username).charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{other.full_name || other.username}</p>
              {conv.lastMessage && (
                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage.content}</p>
              )}
            </div>
            {conv.lastMessage && (
              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                {formatDistanceToNow(new Date(conv.lastMessage.created_at), { locale: fr })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MessageView({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
  const { messages, isLoading, sendMessage } = useMessagesForConversation(conversationId);
  const { profile } = useAuth();
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMsg.trim()) return;
    sendMessage.mutate(newMsg.trim());
    setNewMsg("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center gap-2 mb-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 md:hidden rounded-lg">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-semibold">Conversation</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun message</p>
        ) : (
          messages.map(msg => {
            const isMine = msg.sender_id === profile?.id;
            return (
              <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[75%] px-3 py-2 rounded-2xl text-sm",
                  isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"
                )}>
                  {msg.content}
                  <span className={cn("block text-[10px] mt-1", isMine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: fr })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-border mt-2">
        <Input
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Écrire un message..."
          className="rounded-xl"
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
        />
        <Button size="icon" onClick={handleSend} disabled={!newMsg.trim() || sendMessage.isPending} className="rounded-xl flex-shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function CommunityMessagesContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeConv, setActiveConv] = useState<string | null>(searchParams.get("conv"));

  const handleSelect = (id: string) => {
    setActiveConv(id);
    setSearchParams({ conv: id });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Messages</h1>
      {activeConv ? (
        <MessageView conversationId={activeConv} onBack={() => { setActiveConv(null); setSearchParams({}); }} />
      ) : (
        <ConversationList onSelect={handleSelect} activeId={activeConv} />
      )}
    </div>
  );
}

export default function CommunityMessages() {
  return (
    <CommunityLayout>
      <CommunityMessagesContent />
    </CommunityLayout>
  );
}
