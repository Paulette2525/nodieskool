import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Pin, Trash2, Copy, Check } from "lucide-react";
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
    level: number;
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
  const { profile, isModerator } = useAuth();
  const { isLiked, toggleLike } = usePostLikes(id);
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
        await navigator.share({
          title: `Post de ${author.name}`,
          text: content.slice(0, 100) + (content.length > 100 ? "..." : ""),
          url: postUrl,
        });
      } catch (err) {
        // User cancelled or error
        copyToClipboard(postUrl);
      }
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
    } catch (err) {
      toast.error("Erreur lors de la copie");
    }
  };

  const getLevelBadge = (level: number) => {
    const colors = [
      "bg-gray-100 text-gray-600",
      "bg-emerald-100 text-emerald-700",
      "bg-blue-100 text-blue-700",
      "bg-purple-100 text-purple-700",
      "bg-amber-100 text-amber-700",
    ];
    return colors[Math.min(level - 1, colors.length - 1)] || colors[0];
  };

  // Only moderators/admins can manage posts (delete, pin)
  const canManage = isModerator;

  return (
    <Card className="p-5 shadow-card hover:shadow-md transition-shadow animate-fade-in">
      {/* Pinned indicator */}
      {isPinned && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Pin className="h-3 w-3" />
          <span>Publication épinglée</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.avatar ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {author.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{author.name}</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-medium",
                getLevelBadge(author.level)
              )}>
                Lvl {author.level}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              @{author.username} · {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: fr })}
            </p>
          </div>
        </div>
        
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isModerator && (
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
      <div className="mt-4">
        <p className="text-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Post image" 
            className="mt-4 rounded-lg w-full object-cover max-h-96"
          />
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={!profile}
          className={cn(
            "gap-1.5 text-muted-foreground hover:text-primary",
            (isLiked || optimisticIsLiked) && "text-red-500 hover:text-red-600"
          )}
        >
          <Heart className={cn("h-4 w-4", (isLiked || optimisticIsLiked) && "fill-current")} />
          <span className="text-sm">{isLiked ? likesCount : optimisticLikes}</span>
        </Button>
        <Collapsible open={showComments} onOpenChange={setShowComments}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{commentsCount}</span>
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
        {isModerator && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 text-muted-foreground hover:text-primary ml-auto"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Comments Section */}
      <Collapsible open={showComments} onOpenChange={setShowComments}>
        <CollapsibleContent>
          <CommentSection postId={id} />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
