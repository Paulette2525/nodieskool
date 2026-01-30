import { useState, useRef } from "react";
import { Image, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useStorage } from "@/hooks/useStorage";
import { toast } from "sonner";

interface CreatePostCardProps {
  userAvatar?: string;
  userName: string;
  onPost?: (content: string, imageUrl?: string) => void;
}

export function CreatePostCard({ userAvatar, userName, onPost }: CreatePostCardProps) {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPostImage, uploading } = useStorage();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5 Mo");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedFile) return;
    
    setIsPosting(true);
    try {
      let imageUrl: string | undefined;
      
      if (selectedFile) {
        const url = await uploadPostImage(selectedFile);
        if (url) {
          imageUrl = url;
        } else {
          toast.error("Erreur lors de l'upload de l'image");
          return;
        }
      }
      
      onPost?.(content, imageUrl);
      setContent("");
      setImagePreview(null);
      setSelectedFile(null);
      setIsFocused(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsPosting(false);
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
            placeholder="Partagez quelque chose avec la communauté..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="min-h-[44px] resize-none border-0 p-0 focus-visible:ring-0 placeholder:text-muted-foreground"
            rows={isFocused ? 3 : 1}
          />
          
          {/* Image preview */}
          {imagePreview && (
            <div className="relative mt-3">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="rounded-lg max-h-48 object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={removeImage}
              >
                ×
              </Button>
            </div>
          )}
          
          {isFocused && (
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div className="flex gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Image className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsFocused(false);
                    setContent("");
                    removeImage();
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  size="sm" 
                  onClick={handlePost}
                  disabled={(!content.trim() && !selectedFile) || isPosting || uploading}
                  className="gap-1.5"
                >
                  {(isPosting || uploading) ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Publier
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
