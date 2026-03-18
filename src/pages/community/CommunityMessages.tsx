import { useEffect, useState, useRef } from "react";
import { CommunityLayout } from "@/components/layout/CommunityLayout";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useCommunityMessages } from "@/hooks/useCommunityMessages";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, MessageCircle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

function CommunityMessagesContent() {
  const { community, communityId, isAdmin } = useCommunityContext();
  const { profile } = useAuth();
  const {
    conversations,
    messages,
    activeConversationId,
    loading,
    messagesLoading,
    error,
    openConversation,
    getOrCreateConversation,
    sendMessage,
    setActiveConversationId,
  } = useCommunityMessages(communityId, community?.owner_id || null);

  const [input, setInput] = useState("");
  const [initializing, setInitializing] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // For members: auto-open conversation with owner
  useEffect(() => {
    if (!isAdmin && communityId && profile && !loading) {
      setInitializing(true);
      getOrCreateConversation().then((convId) => {
        if (convId) openConversation(convId);
        setInitializing(false);
      });
    }
  }, [isAdmin, communityId, profile?.id, loading]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeConversationId || sending) return;
    const msg = input;
    setSending(true);
    const success = await sendMessage(msg);
    setSending(false);
    if (success) {
      setInput("");
    }
    inputRef.current?.focus();
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  if (loading || initializing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        {initializing && <p className="text-xs text-muted-foreground">Initialisation de la conversation…</p>}
      </div>
    );
  }

  if (error && !isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <AlertCircle className="h-6 w-6" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  // Member view: direct chat
  if (!isAdmin) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-sm font-semibold">Message privé</h2>
            <p className="text-xs text-muted-foreground">Administrateur de la communauté</p>
          </div>
        </div>
        <ChatArea
          messages={messages}
          messagesLoading={messagesLoading}
          profileId={profile?.id}
          messagesEndRef={messagesEndRef}
        />
        <ChatInput
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          inputRef={inputRef}
          disabled={!activeConversationId || sending}
        />
      </div>
    );
  }

  // Admin view: inbox + chat
  return (
    <div className="flex h-full">
      <div className={cn(
        "border-r border-border flex flex-col flex-shrink-0",
        activeConversationId ? "hidden md:flex w-72" : "w-full md:w-72"
      )}>
        <div className="border-b border-border px-4 py-3 flex-shrink-0">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              Aucun message reçu
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors border-b border-border/50",
                  activeConversationId === conv.id && "bg-accent"
                )}
              >
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={conv.other_user.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {(conv.other_user.full_name || conv.other_user.username)?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {conv.other_user.full_name || conv.other_user.username}
                    </span>
                    {conv.unread_count > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  {conv.last_message && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {conv.last_message.content}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={cn(
        "flex-1 flex flex-col",
        !activeConversationId && "hidden md:flex"
      )}>
        {activeConversationId && activeConversation ? (
          <>
            <div className="border-b border-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                onClick={() => setActiveConversationId(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={activeConversation.other_user.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {(activeConversation.other_user.full_name || activeConversation.other_user.username)?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold">
                {activeConversation.other_user.full_name || activeConversation.other_user.username}
              </span>
            </div>
            <ChatArea
              messages={messages}
              messagesLoading={messagesLoading}
              profileId={profile?.id}
              messagesEndRef={messagesEndRef}
            />
            <ChatInput
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              inputRef={inputRef}
              disabled={sending}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Sélectionnez une conversation
          </div>
        )}
      </div>
    </div>
  );
}

function ChatArea({
  messages,
  messagesLoading,
  profileId,
  messagesEndRef,
}: {
  messages: any[];
  messagesLoading: boolean;
  profileId?: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}) {
  if (messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 && (
        <div className="text-center text-muted-foreground text-sm py-12">
          Aucun message. Envoyez le premier !
        </div>
      )}
      {messages.map((msg) => {
        const isMine = msg.sender_id === profileId;
        return (
          <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                isMine
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              )}
            >
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              <p className={cn(
                "text-[10px] mt-1",
                isMine ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: fr })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

function ChatInput({
  input,
  setInput,
  handleSend,
  inputRef,
  disabled,
}: {
  input: string;
  setInput: (v: string) => void;
  handleSend: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  disabled?: boolean;
}) {
  return (
    <div className="border-t border-border p-3 flex items-center gap-2 flex-shrink-0">
      <Input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        placeholder="Écrire un message..."
        className="flex-1 rounded-xl"
        disabled={disabled}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="rounded-xl h-10 w-10 flex-shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
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
