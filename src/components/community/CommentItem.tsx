import { useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useCommentLikes } from "@/hooks/useCommentLikes";
import { useAuth } from "@/hooks/useAuth";
import type { Comment } from "@/hooks/useComments";

interface CommentItemProps {
  comment: Comment;
  canDelete: boolean;
  onDelete: () => void;
  onReply?: (content: string, parentId: string) => Promise<void>;
  isReply?: boolean;
  depth?: number;
}

export function CommentItem({ 
  comment, 
  canDelete, 
  onDelete, 
  onReply,
  isReply = false,
  depth = 0,
}: CommentItemProps) {
  const { profile } = useAuth();
  const { isLiked, toggleLike } = useCommentLikes(comment.id);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !onReply) return;
    
    setIsSubmitting(true);
    try {
      await onReply(replyContent.trim(), comment.id);
      setReplyContent("");
      setShowReplyInput(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const indent = Math.min(depth, 4);

  return (
    <div className={cn("flex gap-3", isReply && "mt-2")} style={{ marginLeft: `${indent * 24}px` }}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.profiles.avatar_url ?? undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {(comment.profiles.full_name || comment.profiles.username)
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-muted rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {comment.profiles.full_name || comment.profiles.username}
            </span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
        </div>
        
        <div className="flex items-center gap-3 mt-1 ml-1">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
              locale: fr,
            })}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleLike.mutate()}
            disabled={!profile || toggleLike.isPending}
            className={cn(
              "h-6 px-2 gap-1 text-xs text-muted-foreground hover:text-primary",
              isLiked && "text-red-500 hover:text-red-600"
            )}
          >
            <Heart className={cn("h-3 w-3", isLiked && "fill-current")} />
            {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
          </Button>
          
          {profile && onReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="h-6 px-2 gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="h-3 w-3" />
              Répondre
            </Button>
          )}
          
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {showReplyInput && (
          <div className="mt-2 flex gap-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Répondre à ${comment.profiles.full_name || comment.profiles.username}...`}
              className="min-h-[60px] text-sm resize-none"
            />
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                onClick={handleSubmitReply}
                disabled={!replyContent.trim() || isSubmitting}
              >
                Envoyer
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowReplyInput(false);
                  setReplyContent("");
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
