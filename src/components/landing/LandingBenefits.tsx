import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Check, Globe } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import type { User } from "@supabase/supabase-js";

const benefits = [
  "Hébergement de cours illimité",
  "Messagerie privée intégrée",
  "Gestion des membres simplifiée",
  "Événements et calendrier",
  "Analytics et statistiques",
  "Support prioritaire",
];

export default function LandingBenefits({ user }: { user: User | null }) {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge variant="secondary" className="mb-3 text-xs rounded-full">Gratuit pour commencer</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Lancez-vous gratuitement</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Commencez avec notre plan gratuit et évoluez selon vos besoins. Pas de carte bancaire requise.</p>
            <ul className="space-y-2.5 mb-6">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-success" />
                  </div>
                  <span className="text-sm text-foreground">{b}</span>
                </li>
              ))}
            </ul>
            <LiquidButton size="sm" variant="default" onClick={() => navigate("/pricing")}>
              Voir les tarifs
            </LiquidButton>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/12 via-primary/6 to-accent/8 border border-border/30 shadow-lg flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-white/5" />
              <div className="absolute inset-4 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm" />
              <div className="relative text-center p-8">
                <div className="h-16 w-16 rounded-2xl bg-primary mx-auto mb-3 flex items-center justify-center shadow-md ring-4 ring-primary/20">
                  <Globe className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Votre communauté</h3>
                <p className="text-xs text-muted-foreground">Prête en quelques minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
