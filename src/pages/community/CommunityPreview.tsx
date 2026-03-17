import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, Lock, Globe, Loader2, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { saveRedirectUrl } from "@/hooks/useRedirectUrl";
import { useQueryClient } from "@tanstack/react-query";

export function CommunityPreview() {
  const { community, memberCount, adminCount, ownerName, refetch } = useCommunityContext();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [joining, setJoining] = useState(false);
  const queryClient = useQueryClient();

  if (!community) return null;

  const handleJoinCommunity = async () => {
    if (!profile) return;
    setJoining(true);
    try {
      const { error } = await supabase
        .from("community_members")
        .insert({
          community_id: community.id,
          user_id: profile.id,
          role: "member",
          is_approved: community.is_public,
        });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["community"] });
      toast.success(
        community.is_public
          ? "Bienvenue dans la communauté !"
          : "Demande d'adhésion envoyée !"
      );
      refetch();
    } catch (error: any) {
      console.error("Error joining community:", error);
      toast.error("Erreur lors de l'adhésion à la communauté");
    } finally {
      setJoining(false);
    }
  };

  const handleLoginToJoin = () => {
    saveRedirectUrl(location.pathname);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Mobile: sidebar card on top */}
        <div className="block lg:hidden mb-6">
          <SidebarCard
            community={community}
            memberCount={memberCount}
            adminCount={adminCount}
            user={user}
            joining={joining}
            onJoin={handleJoinCommunity}
            onLogin={handleLoginToJoin}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column – main content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-4">
              {community.name}
            </h1>

            {/* Cover image */}
            <div className="rounded-xl overflow-hidden aspect-video bg-muted mb-5">
              {community.cover_url ? (
                <img
                  src={community.cover_url}
                  alt={`${community.name} cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${community.primary_color || 'hsl(var(--primary))'} 0%, ${community.primary_color || 'hsl(var(--primary))'}66 100%)`,
                  }}
                >
                  <span className="text-6xl font-black text-white/20">
                    {community.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs font-medium gap-1.5">
                {community.is_public ? (
                  <><Globe className="h-3 w-3" /> Public</>
                ) : (
                  <><Lock className="h-3 w-3" /> Privé</>
                )}
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1.5 text-xs font-medium gap-1.5">
                <Users className="h-3 w-3" />
                {memberCount.toLocaleString()} membre{memberCount !== 1 ? "s" : ""}
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1.5 text-xs font-medium gap-1.5">
                Gratuit
              </Badge>
              {ownerName && (
                <Badge variant="outline" className="rounded-full px-3 py-1.5 text-xs font-medium gap-1.5">
                  <User className="h-3 w-3" />
                  Par {ownerName}
                </Badge>
              )}
            </div>

            {/* Description */}
            {community.description && (
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                <h2 className="text-lg font-semibold text-foreground mb-2">À propos</h2>
                <p className="whitespace-pre-line">{community.description}</p>
              </div>
            )}
          </div>

          {/* Right column – sticky sidebar (desktop) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8">
              <SidebarCard
                community={community}
                memberCount={memberCount}
                adminCount={adminCount}
                user={user}
                joining={joining}
                onJoin={handleJoinCommunity}
                onLogin={handleLoginToJoin}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SidebarCardProps {
  community: NonNullable<ReturnType<typeof useCommunityContext>["community"]>;
  memberCount: number;
  adminCount: number;
  user: any;
  joining: boolean;
  onJoin: () => void;
  onLogin: () => void;
}

function SidebarCard({ community, memberCount, adminCount, user, joining, onJoin, onLogin }: SidebarCardProps) {
  return (
    <Card className="p-6 shadow-lg border">
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <Avatar className="h-24 w-24 ring-4 ring-background shadow-md">
          {community.logo_url ? (
            <AvatarImage src={community.logo_url} alt={community.name} />
          ) : (
            <AvatarFallback
              className="text-3xl font-bold"
              style={{
                backgroundColor: community.primary_color || 'hsl(var(--primary))',
                color: 'white',
              }}
            >
              {community.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      {/* Name & slug */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold text-foreground">{community.name}</h2>
        <p className="text-xs text-muted-foreground">@{community.slug}</p>
      </div>

      {/* Short description */}
      {community.description && (
        <p className="text-sm text-muted-foreground text-center mb-5 line-clamp-3">
          {community.description}
        </p>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-muted/60 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-bold text-foreground">{memberCount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Membres</p>
        </div>
        <div className="bg-muted/60 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-bold text-foreground">{adminCount}</p>
          <p className="text-xs text-muted-foreground">Admins</p>
        </div>
      </div>

      {/* CTA */}
      {user ? (
        <Button
          onClick={onJoin}
          disabled={joining}
          className="w-full h-12 text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all uppercase tracking-wide"
          size="lg"
          style={{
            backgroundColor: community.primary_color || undefined,
          }}
        >
          {joining && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {community.is_public ? "Rejoindre" : "Demander à rejoindre"}
        </Button>
      ) : (
        <Button
          onClick={onLogin}
          className="w-full h-12 text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all uppercase tracking-wide"
          size="lg"
        >
          Se connecter pour rejoindre
        </Button>
      )}
    </Card>
  );
}
