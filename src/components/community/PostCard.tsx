import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Pin, Trash2, Copy, Check, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { usePostLikes } from "@/hooks/usePosts";
import { usePostBookmark } from "@/hooks/useBookmarks";
import { useAuth } from "@/hooks/useAuth";
import { CommentSection } from "./CommentSection";
import { toast } from "sonner";

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
  onDelete?: () => void;
  onTogglePin?: () => void;
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
  onDelete,
  onTogglePin,
}: PostCardProps) {
  const { profile, isAdmin } = useAuth();
  const { isLiked, toggleLike } = usePostLikes(id);
  const { isBookmarked, toggleBookmark } = usePostBookmark(id);
  const [optimisticLikes, setOptimisticLikes] = useState(likesCount);
  const [optimisticIsLiked, setOptimisticIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLike = () => {
    if (!profile) return;
    const newIsLiked = !isLiked;
    setOptimisticIsLiked(newIsLiked);
    setOptimisticLikes(newIsLiked ? likesCount + 1 : likesCount);
    toggleLike.mutate();
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

  const canManage = isAdmin;

  return (
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
              {isAdmin && (
                <DropdownMenuItem onClick={onTogglePin}>
                  <Pin className="h-4 w-4 mr-2" />
                  {isPinned ? "Désépingler" : "Épingler"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      <div className="mt-3">
        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Post image" 
            className="mt-3 rounded-xl w-full object-cover max-h-80"
          />
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
            (isLiked || optimisticIsLiked) && "text-red-500 hover:text-red-600"
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", (isLiked || optimisticIsLiked) && "fill-current")} />
          <span>{isLiked ? likesCount : optimisticLikes}</span>
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
            onClick={() => toggleBookmark.mutate()}
            disabled={toggleBookmark.isPending}
            className={cn(
              "gap-1.5 text-muted-foreground hover:text-foreground rounded-xl h-8 px-3 text-xs",
              isBookmarked && "text-amber-500 hover:text-amber-600"
            )}
          >
            <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-current")} />
          </Button>
        )}
        
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 text-muted-foreground hover:text-foreground ml-auto rounded-xl h-8 px-3 text-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>

      <Collapsible open={showComments} onOpenChange={setShowComments}>
        <CollapsibleContent>
          <CommentSection postId={id} />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
