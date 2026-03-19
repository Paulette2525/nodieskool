import { Link, useNavigate } from "react-router-dom";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

interface Community {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

export default function LandingCommunities({ communities }: { communities: Community[] }) {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Communautés populaires</h2>
          <p className="text-sm text-muted-foreground">Rejoignez des communautés actives</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {communities.slice(0, 3).map((community) => (
            <Link key={community.id} to={`/c/${community.slug}/community`}>
              <div className="group relative p-5 rounded-2xl bg-card border border-border/40 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-base mb-3 shadow-sm">
                    {community.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{community.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{community.description || "Une communauté dynamique"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <LiquidButton size="sm" variant="default" onClick={() => navigate("/discover")}>
            Voir toutes
          </LiquidButton>
        </div>
      </div>
    </section>
  );
}
