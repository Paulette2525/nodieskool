import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useComments, Comment } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { profile, isAdmin } = useAuth();
  const { comments, isLoading, createComment, deleteComment } = useComments(postId);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    createComment.mutate(newComment.trim());
    setNewComment("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t pt-4 mt-4 space-y-4">
      {/* Comment input */}
      {profile && (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {(profile.full_name || profile.username)?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder="Écrire un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[40px] max-h-[120px] resize-none"
              rows={1}
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!newComment.trim() || createComment.isPending}
            >
              {createComment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">
          Aucun commentaire. Soyez le premier !
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canDelete={isAdmin}
              onDelete={() => deleteComment.mutate(comment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  canDelete: boolean;
  onDelete: () => void;
}

function CommentItem({ comment, canDelete, onDelete }: CommentItemProps) {
  return (
    <div className="flex gap-3 group">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.profiles.avatar_url ?? undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {(comment.profiles.full_name || comment.profiles.username)?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-muted rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {comment.profiles.full_name || comment.profiles.username}
            </span>
            <span className="text-xs text-muted-foreground">
              Lvl {comment.profiles.level}
            </span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
              locale: fr,
            })}
          </span>
          {canDelete && (
            <button
              onClick={onDelete}
              className="text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
