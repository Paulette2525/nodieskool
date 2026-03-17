import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, Lock, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { saveRedirectUrl } from "@/hooks/useRedirectUrl";
import { useQueryClient } from "@tanstack/react-query";

export function CommunityPreview() {
  const { community, memberCount, refetch } = useCommunityContext();
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
    <div className="min-h-screen bg-background">
      {/* Hero Cover */}
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
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
              background: `linear-gradient(135deg, ${community.primary_color || 'hsl(var(--primary))'} 0%, ${community.primary_color || 'hsl(var(--primary))'}88 50%, ${community.primary_color || 'hsl(var(--primary))'}44 100%)`,
            }}
          >
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="2" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 -mt-24 relative z-10 pb-12">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <Avatar className="h-28 w-28 border-4 border-background shadow-xl ring-2 ring-primary/20">
            {community.logo_url ? (
              <AvatarImage src={community.logo_url} alt={community.name} />
            ) : (
              <AvatarFallback
                className="text-4xl font-bold"
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

        {/* Name */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            {community.name}
          </h1>
          <p className="text-muted-foreground text-sm">@{community.slug}</p>
        </div>

        {/* Description */}
        {community.description && (
          <p className="text-center text-muted-foreground leading-relaxed mb-8 max-w-md mx-auto">
            {community.description}
          </p>
        )}

        {/* Stats badges */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2 bg-muted/60 rounded-full px-4 py-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{memberCount}</span>
            <span className="text-muted-foreground text-sm">membre{memberCount !== 1 ? "s" : ""}</span>
          </div>
          <Badge
            variant={community.is_public ? "secondary" : "outline"}
            className="rounded-full px-4 py-2 text-sm"
          >
            {community.is_public ? (
              <>
                <Globe className="h-3.5 w-3.5 mr-1.5" />
                Public
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 mr-1.5" />
                Privé
              </>
            )}
          </Badge>
        </div>

        {/* CTA */}
        {user ? (
          <Button
            onClick={handleJoinCommunity}
            disabled={joining}
            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            size="lg"
            style={{
              backgroundColor: community.primary_color || undefined,
            }}
          >
            {joining && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {community.is_public
              ? "Rejoindre la communauté"
              : "Demander à rejoindre"}
          </Button>
        ) : (
          <Button
            onClick={handleLoginToJoin}
            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            Se connecter pour rejoindre
          </Button>
        )}
      </div>
    </div>
  );
}
