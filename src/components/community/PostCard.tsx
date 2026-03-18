import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Pin, Trash2, Copy, Check, Bookmark, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { CommentSection } from "./CommentSection";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PostCardProps {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string | null;
  };
  content: string;
  imageUrl?: string | null;
  isPinned?: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isCommunityAdmin?: boolean;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onDelete?: () => void;
  onTogglePin?: () => void;
  onEdit?: (postId: string, content: string) => void;
  onToggleLike?: () => void;
  onToggleBookmark?: () => void;
  isEditPending?: boolean;
}

export function PostCard({
  id,
  author,
  content,
  imageUrl,
  isPinned,
  likesCount,
  commentsCount,
  createdAt,
  isCommunityAdmin,
  isLiked = false,
  isBookmarked = false,
  onDelete,
  onTogglePin,
  onEdit,
  onToggleLike,
  onToggleBookmark,
  isEditPending,
}: PostCardProps) {
  const { profile, isAdmin } = useAuth();
  const [optimisticLikes, setOptimisticLikes] = useState(likesCount);
  const [optimisticIsLiked, setOptimisticIsLiked] = useState(isLiked);
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    setOptimisticIsLiked(isLiked);
    setOptimisticLikes(likesCount);
  }, [isLiked, likesCount]);

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight + 2);
    }
  }, [content]);

  const handleLike = () => {
    if (!profile) return;
    const newIsLiked = !optimisticIsLiked;
    setOptimisticIsLiked(newIsLiked);
    setOptimisticLikes(newIsLiked ? likesCount + 1 : likesCount);
    onToggleLike?.();
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/community?post=${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Post de ${author.name}`, text: content.slice(0, 100), url: postUrl });
      } catch { copyToClipboard(postUrl); }
    } else {
      copyToClipboard(postUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error("Erreur lors de la copie"); }
  };

  const handleEditSubmit = () => {
    if (!editContent.trim()) return;
    onEdit?.(id, editContent.trim());
    setEditOpen(false);
  };

  const isOwner = profile?.id === author.id;
  const canManage = isAdmin || isCommunityAdmin || isOwner;

  return (
    <>
      <Card className="p-6 rounded-2xl border-border/50 shadow-card hover:shadow-card-hover transition-all duration-200 animate-fade-in">
        {isPinned && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 font-medium">
            <Pin className="h-3 w-3" />
            <span>Publication épinglée</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={author.avatar ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {author.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold text-sm text-foreground">{author.name}</span>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: fr })}
              </p>
            </div>
          </div>
          
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {isOwner && onEdit && (
                  <DropdownMenuItem onClick={() => { setEditContent(content); setEditOpen(true); }}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={onTogglePin}>
                    <Pin className="h-4 w-4 mr-2" />
                    {isPinned ? "Désépingler" : "Épingler"}
                  </DropdownMenuItem>
                )}
                {(isOwner || isAdmin || isCommunityAdmin) && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content with truncation */}
        <div className="mt-3">
          <p
            ref={contentRef}
            className={cn(
              "text-sm text-foreground whitespace-pre-wrap leading-relaxed",
              !expanded && "line-clamp-[7]"
            )}
          >
            {content}
          </p>
          {isTruncated && !expanded && (
            <button onClick={() => setExpanded(true)} className="text-sm font-medium text-primary hover:underline mt-1">
              Voir plus
            </button>
          )}
          {expanded && isTruncated && (
            <button onClick={() => setExpanded(false)} className="text-sm font-medium text-primary hover:underline mt-1">
              Voir moins
            </button>
          )}
          {imageUrl && (
            <img src={imageUrl} alt="Post image" className="mt-3 rounded-xl w-full object-cover max-h-80" />
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-0.5 -ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={!profile}
            className={cn(
              "gap-1.5 text-muted-foreground hover:text-foreground rounded-xl h-8 px-3 text-xs",
              optimisticIsLiked && "text-red-500 hover:text-red-600"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", optimisticIsLiked && "fill-current")} />
            <span>{optimisticLikes}</span>
          </Button>
          <Collapsible open={showComments} onOpenChange={setShowComments}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground rounded-xl h-8 px-3 text-xs">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{commentsCount}</span>
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
          
          {profile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleBookmark?.()}
              className={cn(
                "gap-1.5 text-muted-foreground hover:text-foreground rounded-xl h-8 px-3 text-xs",
                isBookmarked && "text-amber-500 hover:text-amber-600"
              )}
            >
              <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-current")} />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 text-muted-foreground hover:text-foreground ml-auto rounded-xl h-8 px-3 text-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
          </Button>
        </div>

        <Collapsible open={showComments} onOpenChange={setShowComments}>
          <CollapsibleContent>
            <CommentSection postId={id} />
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier la publication</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[200px] resize-y"
            placeholder="Contenu de la publication..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button onClick={handleEditSubmit} disabled={!editContent.trim() || isEditPending}>
              {isEditPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
