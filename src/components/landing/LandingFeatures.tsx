import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, MessageSquare, Calendar, Zap, Shield } from "lucide-react";

const features = [
  { icon: Users, title: "Communauté engagée", description: "Créez un espace de discussion et d'entraide pour votre audience" },
  { icon: BookOpen, title: "Formations complètes", description: "Hébergez vos cours avec suivi de progression et quiz" },
  { icon: MessageSquare, title: "Messagerie privée", description: "Échangez en privé avec les membres de votre communauté" },
  { icon: Calendar, title: "Événements live", description: "Organisez des webinaires, masterclass et sessions Q&A" },
  { icon: Zap, title: "Performance optimale", description: "Une plateforme rapide et fiable pour une expérience fluide" },
  { icon: Shield, title: "Sécurité garantie", description: "Vos données et celles de vos membres sont protégées" },
];

export default function LandingFeatures() {
  return (
    <section id="features" className="py-20 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3 text-xs rounded-full">Fonctionnalités</Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Tout ce dont vous avez besoin</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">Une plateforme complète pour créer et développer votre communauté</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-card border border-border/40 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors duration-300">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1.5">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
