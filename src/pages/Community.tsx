import { MainLayout } from "@/components/layout/MainLayout";
import { CreatePostCard } from "@/components/community/CreatePostCard";
import { PostCard } from "@/components/community/PostCard";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

// Mock data
const mockPosts = [
  {
    id: "1",
    author: { name: "Sarah Johnson", avatar: "", level: 4 },
    content: "Just completed the entire Marketing Mastery course! 🎉 The strategies about customer journey mapping were eye-opening. Already implementing them in my business and seeing results.\n\nIf anyone wants to discuss the concepts from Module 3, I'd love to connect!",
    isPinned: true,
    likesCount: 42,
    commentsCount: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "2",
    author: { name: "Michael Chen", avatar: "", level: 2 },
    content: "Quick win today: Applied the productivity framework from yesterday's live session and managed to clear my entire backlog. Sometimes the simplest systems work best! 💪",
    likesCount: 28,
    commentsCount: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "3",
    author: { name: "Emily Rodriguez", avatar: "", level: 3 },
    content: "Has anyone experimented with the cold email templates from the Sales module? Would love to hear your results and any tweaks you made!",
    likesCount: 15,
    commentsCount: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
];

const topMembers = [
  { name: "David Kim", avatar: "", points: 2450, level: 5 },
  { name: "Sarah Johnson", avatar: "", points: 2180, level: 4 },
  { name: "Alex Martinez", avatar: "", points: 1890, level: 4 },
];

export default function Community() {
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
            <CreatePostCard 
              userName="John Doe"
              onPost={(content) => console.log("New post:", content)}
            />
            
            {mockPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                author={post.author}
                content={post.content}
                isPinned={post.isPinned}
                likesCount={post.likesCount}
                commentsCount={post.commentsCount}
                createdAt={post.createdAt}
              />
            ))}
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
                  <div key={member.name} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
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
                  <p className="text-2xl font-bold text-foreground">248</p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">1.2k</p>
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
