import { CommunityLayout } from "@/components/layout/CommunityLayout";
import { CreatePostCard } from "@/components/community/CreatePostCard";
import { PostCard } from "@/components/community/PostCard";
import { Card } from "@/components/ui/card";
import { Loader2, Users, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePostsWithCommunity } from "@/hooks/usePosts";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function CommunityHeader() {
  const { community, memberCount } = useCommunityContext();
  if (!community) return null;

  return (
    <div className="mb-6 -mx-6 -mt-6">
      {/* Cover */}
      <div className="relative h-32 md:h-44 overflow-hidden rounded-t-lg">
        {community.cover_url ? (
          <img
            src={community.cover_url}
            alt={`${community.name} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${community.primary_color || 'hsl(var(--primary))'} 0%, ${community.primary_color || 'hsl(var(--primary))'}66 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Info bar */}
      <div className="px-6 -mt-8 relative z-10">
        <div className="flex items-end gap-4">
          <Avatar className="h-16 w-16 border-3 border-background shadow-lg">
            {community.logo_url ? (
              <AvatarImage src={community.logo_url} alt={community.name} />
            ) : (
              <AvatarFallback
                className="text-xl font-bold"
                style={{
                  backgroundColor: community.primary_color || 'hsl(var(--primary))',
                  color: 'white',
                }}
              >
                {community.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-xl font-bold text-foreground truncate">{community.name}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {memberCount} membre{memberCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        {community.description && (
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            {community.description}
          </p>
        )}
        <div className="border-b mt-4" />
      </div>
    </div>
  );
}

function CommunityFeedContent() {
  const { profile } = useAuth();
  const { community } = useCommunityContext();
  const { posts, isLoading, createPost, deletePost, togglePin } = usePostsWithCommunity(community?.id);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <CommunityHeader />

      <div className="space-y-4 mt-6">
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
            <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">Aucun post pour le moment</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Soyez le premier à partager !</p>
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
