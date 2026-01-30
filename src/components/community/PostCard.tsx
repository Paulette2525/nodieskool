import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Pin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  id: string;
  author: {
    name: string;
    avatar?: string;
    level: number;
  };
  content: string;
  imageUrl?: string;
  isPinned?: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
}

export function PostCard({
  author,
  content,
  imageUrl,
  isPinned,
  likesCount,
  commentsCount,
  createdAt,
  isLiked = false,
  onLike,
  onComment,
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likesCount);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    onLike?.();
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

  return (
    <Card className="p-5 shadow-card hover:shadow-md transition-shadow animate-fade-in">
      {/* Pinned indicator */}
      {isPinned && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Pin className="h-3 w-3" />
          <span>Pinned post</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.avatar} />
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
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
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
          className={cn(
            "gap-1.5 text-muted-foreground hover:text-primary",
            liked && "text-red-500 hover:text-red-600"
          )}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          <span className="text-sm">{likes}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onComment}
          className="gap-1.5 text-muted-foreground hover:text-primary"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">{commentsCount}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-primary ml-auto"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
