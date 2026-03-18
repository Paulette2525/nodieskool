import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Users, Globe, ArrowLeft } from "lucide-react";
import tribbueLogoImg from "@/assets/tribbue-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PublicCommunity {
  id: string; name: string; slug: string; description: string | null; logo_url: string | null; cover_url: string | null; is_public: boolean; member_count: number;
}

export default function Discover() {
  const { user, loading: authLoading } = useAuth();

  const { data: communities, isLoading } = useQuery({
    queryKey: ["public-communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities_public")
        .select("id, name, slug, description, logo_url, cover_url, is_public")
        .eq("is_public", true)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data?.length) return [] as PublicCommunity[];

      // Batch: get all member counts in one RPC call per community
      // Use Promise.all but with the RPC function (no N+1 on community_members table)
      const counts = await Promise.all(
        data.map(c =>
          supabase.rpc('get_community_member_count', { _community_id: c.id! })
            .then(r => ({ id: c.id, count: r.data ?? 0 }))
        )
      );
      const countMap = Object.fromEntries(counts.map(c => [c.id, c.count]));

      return data.map(c => ({
        ...c,
        member_count: countMap[c.id!] || 0,
      })) as PublicCommunity[];
    },
    staleTime: 2 * 60 * 1000,
  });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user && <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg"><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>}
            <Link to="/" className="flex items-center gap-2">
              <img src={tribbueLogoImg} alt="Tribbue" className="h-8 object-contain" loading="lazy" />
            </Link>
          </div>
          {!user && <Button asChild size="sm" className="rounded-xl text-xs h-9"><Link to="/auth">Se connecter</Link></Button>}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Découvrir</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Explorez les communautés publiques</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : !communities || communities.length === 0 ? (
          <Card className="p-10 text-center rounded-2xl border-border/50">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3"><Users className="h-5 w-5 text-muted-foreground" /></div>
            <h3 className="text-sm font-semibold mb-1.5">Aucune communauté publique</h3>
            <p className="text-xs text-muted-foreground mb-4">Il n'y a pas encore de communautés à découvrir.</p>
            {user && <Button asChild size="sm" className="rounded-xl text-xs"><Link to="/create-community">Créer une communauté</Link></Button>}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((community) => (
              <Link key={community.id} to={`/c/${community.slug}/community`} className="block">
                <Card className="overflow-hidden hover:shadow-card-hover transition-all duration-200 h-full rounded-2xl border-border/50 shadow-card">
                  <div className="h-20 bg-gradient-to-r from-primary/15 to-primary/5 relative">
                    {community.cover_url && <img src={community.cover_url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />}
                    <div className="absolute -bottom-5 left-3.5">
                      <Avatar className="h-10 w-10 border-2 border-background">
                        {community.logo_url ? <AvatarImage src={community.logo_url} alt={community.name} /> : <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{community.name.charAt(0).toUpperCase()}</AvatarFallback>}
                      </Avatar>
                    </div>
                  </div>
                  <div className="p-3.5 pt-7">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-foreground truncate">{community.name}</h3>
                      <Badge variant="secondary" className="shrink-0 text-[10px] rounded-full"><Globe className="h-2.5 w-2.5 mr-1" />Public</Badge>
                    </div>
                    {community.description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{community.description}</p>}
                    <div className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /><span>{community.member_count} membre{community.member_count !== 1 ? "s" : ""}</span>
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
