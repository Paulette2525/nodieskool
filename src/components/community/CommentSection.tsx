import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/hooks/useComments";
import { CommentItem } from "./CommentItem";
import type { Comment } from "@/hooks/useComments";

interface CommentSectionProps {
  postId: string;
}

function CommentThread({
  comment,
  allComments,
  canDelete,
  onDelete,
  onReply,
  depth = 0,
}: {
  comment: Comment;
  allComments: Comment[];
  canDelete: boolean;
  onDelete: (id: string) => void;
  onReply: (content: string, parentId: string) => Promise<void>;
  depth?: number;
}) {
  const replies = allComments.filter((c) => c.parent_id === comment.id);
  const maxIndent = 4;

  return (
    <div>
      <CommentItem
        comment={comment}
        canDelete={canDelete}
        onDelete={() => onDelete(comment.id)}
        onReply={onReply}
        isReply={depth > 0}
        depth={Math.min(depth, maxIndent)}
      />
      {replies.length > 0 && (
        <div>
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              allComments={allComments}
              canDelete={canDelete}
              onDelete={onDelete}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
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

  const topLevelComments = comments.filter((c) => !c.parent_id);

  return (
    <div className="mt-4 pt-4 border-t space-y-4">
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

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">
          Aucun commentaire. Soyez le premier à commenter !
        </p>
      ) : (
        <div className="space-y-3">
          {topLevelComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              allComments={comments}
              canDelete={isAdmin}
              onDelete={(id) => deleteComment.mutate(id)}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
