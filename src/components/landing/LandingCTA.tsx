import { Link, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import type { User } from "@supabase/supabase-js";

export default function LandingCTA({ user }: { user: User | null }) {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative p-10 md:p-14 text-center rounded-3xl border border-border/30 overflow-hidden">
          {/* Glass background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-card to-accent/5" />
          <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

          <div className="relative">
            <div className="inline-flex items-center gap-0.5 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Prêt à créer votre communauté ?</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-lg mx-auto">Rejoignez des milliers de créateurs qui utilisent notre plateforme</p>
            
            <ShinyButton onClick={() => navigate(user ? "/dashboard" : "/auth")}>
              Commencer gratuitement
            </ShinyButton>
            
            <p className="text-[11px] text-muted-foreground mt-5">Pas de carte bancaire • Annulez à tout moment</p>
          </div>
        </div>
      </div>
    </section>
  );
}
