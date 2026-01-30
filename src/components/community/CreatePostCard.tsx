import { useState } from "react";
import { Image, Link, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface CreatePostCardProps {
  userAvatar?: string;
  userName: string;
  onPost?: (content: string) => void;
}

export function CreatePostCard({ userAvatar, userName, onPost }: CreatePostCardProps) {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handlePost = () => {
    if (content.trim()) {
      onPost?.(content);
      setContent("");
      setIsFocused(false);
    }
  };

  return (
    <Card className="p-4 shadow-card">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {userName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Share something with the community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="min-h-[44px] resize-none border-0 p-0 focus-visible:ring-0 placeholder:text-muted-foreground"
            rows={isFocused ? 3 : 1}
          />
          
          {isFocused && (
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Image className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Link className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsFocused(false);
                    setContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handlePost}
                  disabled={!content.trim()}
                  className="gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Post
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
