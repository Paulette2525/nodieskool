import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { CreatePostCard } from "@/components/community/CreatePostCard";
import { PostCard } from "@/components/community/PostCard";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";

export default function Community() {
  const { user, profile, loading } = useAuth();
  const { posts, isLoading, createPost, updatePost, deletePost, togglePin } = usePosts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Community</h1>
          <p className="text-muted-foreground mt-1">Share, learn, and grow together</p>
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
              <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
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
    </MainLayout>
  );
}
