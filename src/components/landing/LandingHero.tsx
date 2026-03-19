import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Download } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import type { User } from "@supabase/supabase-js";

const stats = [
  { value: "10k+", label: "Utilisateurs" },
  { value: "500+", label: "Communautés" },
  { value: "50k+", label: "Cours suivis" },
  { value: "99.9%", label: "Disponibilité" },
];

export default function LandingHero({ user, isStandalone }: { user: User | null; isStandalone: boolean }) {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent pointer-events-none" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center relative animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Badge variant="secondary" className="mb-5 px-3 py-1.5 text-xs font-medium bg-primary/8 text-primary border-none rounded-full">
          Plateforme communautaire tout-en-un
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-5 leading-[1.1] tracking-tight">
          Créez votre<span className="block text-primary">communauté d'apprentissage</span>
        </h1>

        <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
          Rassemblez votre audience, partagez vos cours et créez une communauté engagée avec une plateforme <span className="text-foreground font-medium">simple et puissante</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-5 mb-10">
          {/* Primary CTA - ShinyButton */}
          <ShinyButton onClick={() => navigate(user ? "/dashboard" : "/auth")}>
            Créer ma communauté
          </ShinyButton>

          {/* Secondary buttons row */}
          <div className="flex items-center gap-4">
            <Button size="sm" variant="outline" className="rounded-full text-xs h-9 px-5 border-border/60 hover:bg-muted/60" asChild>
              <Link to="/pricing">
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Voir la démo
              </Link>
            </Button>

            {!isStandalone && (
              <Button size="sm" variant="ghost" className="rounded-full text-xs h-9 px-5 text-muted-foreground hover:text-foreground" asChild>
                <Link to="/install">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Installer
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto pt-8 border-t border-border/50">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center animate-in fade-in duration-500">
              <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
