import { CommunityLayout } from "@/components/layout/CommunityLayout";
import { CreatePostCard } from "@/components/community/CreatePostCard";
import { PostCard } from "@/components/community/PostCard";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePostsWithCommunity } from "@/hooks/usePosts";
import { useCommunityContext } from "@/contexts/CommunityContext";

function CommunityFeedContent() {
  const { profile } = useAuth();
  const { community } = useCommunityContext();
  const { posts, isLoading, createPost, deletePost, togglePin } = usePostsWithCommunity(community?.id);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{community?.name}</h1>
        <p className="text-muted-foreground mt-1">
          {community?.description || "Partagez, apprenez et progressez ensemble"}
        </p>
      </div>

      <div className="space-y-4">
        {profile && (
          <CreatePostCard 
            userName={profile.full_name || profile.username}
            userAvatar={profile.avatar_url ?? undefined}
            onPost={(content, imageUrl) => createPost.mutate({ content, imageUrl })}
          />
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aucun post pour le moment. Soyez le premier à partager !</p>
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
                level: post.profiles.level,
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
