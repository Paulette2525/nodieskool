import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Users, Globe, Lock, Sparkles, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PublicCommunity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  is_public: boolean;
  member_count: number;
}

export default function Discover() {
  const { user, loading: authLoading } = useAuth();

  const { data: communities, isLoading } = useQuery({
    queryKey: ["public-communities"],
    queryFn: async () => {
      // Fetch all public communities using secure view (excludes owner_id)
      const { data: communitiesData, error } = await supabase
        .from("communities_public")
        .select("id, name, slug, description, logo_url, cover_url, is_public")
        .eq("is_public", true)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch member counts for each community
      const communitiesWithCounts = await Promise.all(
        (communitiesData || []).map(async (community) => {
          const { count } = await supabase
            .from("community_members")
            .select("*", { count: "exact", head: true })
            .eq("community_id", community.id)
            .eq("is_approved", true);

          return {
            ...community,
            member_count: count || 0,
          };
        })
      );

      return communitiesWithCounts as PublicCommunity[];
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user && (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">NodieSkool</span>
            </Link>
          </div>

          {!user && (
            <Button asChild>
              <Link to="/auth">Se connecter</Link>
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Découvrir des communautés
          </h1>
          <p className="text-muted-foreground mt-1">
            Explorez et rejoignez des communautés publiques
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !communities || communities.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune communauté publique</h3>
            <p className="text-muted-foreground mb-4">
              Il n'y a pas encore de communautés publiques à découvrir.
            </p>
            {user && (
              <Button asChild>
                <Link to="/create-community">Créer une communauté</Link>
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <Link
                key={community.id}
                to={`/c/${community.slug}/community`}
                className="block"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  {/* Cover */}
                  <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/10 relative">
                    {community.cover_url && (
                      <img
                        src={community.cover_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute -bottom-6 left-4">
                      <Avatar className="h-12 w-12 border-2 border-background">
                        {community.logo_url ? (
                          <AvatarImage src={community.logo_url} alt={community.name} />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {community.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 pt-8">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground truncate">
                        {community.name}
                      </h3>
                      <Badge variant="secondary" className="shrink-0">
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    </div>
                    {community.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {community.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{community.member_count} membre{community.member_count !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}