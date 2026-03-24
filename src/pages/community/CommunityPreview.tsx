import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, Lock, Globe, Loader2, User } from "lucide-react";
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
      const { error } = await supabase.from("community_members").insert({
        community_id: community.id, user_id: profile.id, role: "member", is_approved: community.is_public,
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["community"] });
      toast.success(community.is_public ? "Bienvenue dans la communauté !" : "Demande d'adhésion envoyée !");
      refetch();
    } catch (error: any) {
      console.error("Error joining community:", error);
      toast.error("Erreur lors de l'adhésion à la communauté");
    } finally { setJoining(false); }
  };

  const handleLoginToJoin = () => { saveRedirectUrl(location.pathname); navigate("/auth"); };

  const primaryColor = community.primary_color || 'hsl(var(--primary))';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Cover */}
            <div className="rounded-2xl overflow-hidden aspect-[2.4/1] bg-muted mb-6">
              {community.cover_url ? (
                <img src={community.cover_url} alt={`${community.name} cover`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}55 100%)` }}>
                  <span className="text-5xl font-black text-white/15">{community.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Title + badges */}
            <h1 className="text-2xl font-bold text-foreground mb-3">{community.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium gap-1.5">
                {community.is_public ? <><Globe className="h-3 w-3" /> Public</> : <><Lock className="h-3 w-3" /> Privé</>}
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium gap-1.5 border-border/50">
                <Users className="h-3 w-3" />
                {memberCount.toLocaleString()} membre{memberCount !== 1 ? "s" : ""}
              </Badge>
              {ownerName && (
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium gap-1.5 border-border/50">
                  <User className="h-3 w-3" /> Par {ownerName}
                </Badge>
              )}
            </div>

            {/* Mobile CTA */}
            <div className="block lg:hidden mb-6">
              <CTAButton community={community} user={user} joining={joining} onJoin={handleJoinCommunity} onLogin={handleLoginToJoin} />
            </div>

            {/* Description */}
            {community.description && (
              <div className="max-w-xl">
                <h2 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider">À propos</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{community.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-8">
              <Card className="p-5 rounded-2xl border-border/50 shadow-card">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-16 w-16 ring-2 ring-background shadow-sm">
                    {community.logo_url ? (
                      <AvatarImage src={community.logo_url} alt={community.name} />
                    ) : (
                      <AvatarFallback className="text-xl font-bold" style={{ backgroundColor: primaryColor, color: 'white' }}>
                        {community.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="text-center mb-4">
                  <h2 className="text-sm font-bold text-foreground">{community.name}</h2>
                  <p className="text-xs text-muted-foreground">@{community.slug}</p>
                </div>
                {community.description && (
                  <p className="text-xs text-muted-foreground text-center mb-4 line-clamp-3 leading-relaxed">{community.description}</p>
                )}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="bg-muted/60 rounded-xl p-2.5 text-center">
                    <p className="text-lg font-bold text-foreground">{memberCount.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Membres</p>
                  </div>
                  <div className="bg-muted/60 rounded-xl p-2.5 text-center">
                    <p className="text-lg font-bold text-foreground">{adminCount}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Admins</p>
                  </div>
                </div>
                <CTAButton community={community} user={user} joining={joining} onJoin={handleJoinCommunity} onLogin={handleLoginToJoin} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CTAButton({ community, user, joining, onJoin, onLogin }: { community: any; user: any; joining: boolean; onJoin: () => void; onLogin: () => void }) {
  return user ? (
    <Button onClick={onJoin} disabled={joining} className="w-full h-11 text-sm font-semibold rounded-xl shadow-sm transition-all" size="lg"
      style={{ backgroundColor: community.primary_color || undefined }}>
      {joining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {community.is_public ? "Rejoindre" : "Demander à rejoindre"}
    </Button>
  ) : (
    <Button onClick={onLogin} className="w-full h-11 text-sm font-semibold rounded-xl shadow-sm transition-all" size="lg">
      Se connecter pour rejoindre
    </Button>
  );
}
