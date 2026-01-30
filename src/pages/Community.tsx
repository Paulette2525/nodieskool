import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { CreatePostCard } from "@/components/community/CreatePostCard";
import { PostCard } from "@/components/community/PostCard";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { useLeaderboard } from "@/hooks/useLeaderboard";

export default function Community() {
  const { user, profile, loading } = useAuth();
  const { posts, isLoading, createPost, deletePost, togglePin } = usePosts();
  const { data: leaderboard } = useLeaderboard();

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

  const topMembers = leaderboard?.slice(0, 3) ?? [];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Community</h1>
          <p className="text-muted-foreground mt-1">Share, learn, and grow together</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main feed */}
          <div className="lg:col-span-2 space-y-4">
            {profile && (
              <CreatePostCard 
                userName={profile.full_name || profile.username}
                userAvatar={profile.avatar_url ?? undefined}
                onPost={(content) => createPost.mutate(content)}
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

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Top Members */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">Top Members</h3>
              </div>
              <div className="space-y-3">
                {topMembers.map((member, index) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {(member.full_name || member.username).split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.full_name || member.username}</p>
                      <p className="text-xs text-muted-foreground">Level {member.level}</p>
                    </div>
                    <span className="text-sm font-semibold text-accent">{member.points}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Community Stats */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-4">Community Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{leaderboard?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{posts.length}</p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
