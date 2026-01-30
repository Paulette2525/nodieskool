import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/hooks/useComments";
import { CommentItem } from "./CommentItem";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { profile, isAdmin } = useAuth();
  const { comments, isLoading, createComment, deleteComment } = useComments(postId);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    await createComment.mutateAsync({ content: newComment.trim() });
    setNewComment("");
  };

  const handleReply = async (content: string, parentId: string) => {
    await createComment.mutateAsync({ content, parentId });
  };

  // Separate top-level comments and replies
  const topLevelComments = comments.filter((c) => !c.parent_id);
  const repliesMap = comments.reduce((acc, comment) => {
    if (comment.parent_id) {
      if (!acc[comment.parent_id]) {
        acc[comment.parent_id] = [];
      }
      acc[comment.parent_id].push(comment);
    }
    return acc;
  }, {} as Record<string, typeof comments>);

  return (
    <div className="mt-4 pt-4 border-t space-y-4">
      {/* Comment input */}
      {profile && (
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écrire un commentaire..."
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!newComment.trim() || createComment.isPending}
            className="flex-shrink-0"
          >
            {createComment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">
          Aucun commentaire. Soyez le premier à commenter !
        </p>
      ) : (
        <div className="space-y-4">
          {topLevelComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                canDelete={isAdmin}
                onDelete={() => deleteComment.mutate(comment.id)}
                onReply={handleReply}
              />
              {/* Replies */}
              {repliesMap[comment.id]?.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  canDelete={isAdmin}
                  onDelete={() => deleteComment.mutate(reply.id)}
                  isReply
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
