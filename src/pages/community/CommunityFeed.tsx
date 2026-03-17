import { CommunityLayout } from "@/components/layout/CommunityLayout";
import { CreatePostCard } from "@/components/community/CreatePostCard";
import { PostCard } from "@/components/community/PostCard";
import { Card } from "@/components/ui/card";
import { Loader2, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePostsWithCommunity } from "@/hooks/usePosts";
import { useCommunityContext } from "@/contexts/CommunityContext";

function CommunityFeedContent() {
  const { profile } = useAuth();
  const { community } = useCommunityContext();
  const { posts, isLoading, createPost, deletePost, togglePin } = usePostsWithCommunity(community?.id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="space-y-3">
        {profile && (
          <CreatePostCard 
            userName={profile.full_name || profile.username}
            userAvatar={profile.avatar_url ?? undefined}
            onPost={(content, imageUrl) => createPost.mutate({ content, imageUrl })}
          />
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-10 text-center rounded-2xl border-border/50">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm font-medium">Aucun post pour le moment</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Soyez le premier à partager !</p>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              author={{
                id: post.profiles.id,
                name: post.profiles.full_name || post.profiles.username,
                username: post.profiles.username,
                avatar: post.profiles.avatar_url,
              }}
              content={post.content}
              imageUrl={post.image_url}
              isPinned={post.is_pinned}
              likesCount={post.likes_count}
              commentsCount={post.comments_count}
              createdAt={post.created_at}
              onDelete={() => deletePost.mutate(post.id)}
              onTogglePin={() => togglePin.mutate({ postId: post.id, isPinned: post.is_pinned })}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function CommunityFeed() {
  return (
    <CommunityLayout>
      <CommunityFeedContent />
    </CommunityLayout>
  );
}
