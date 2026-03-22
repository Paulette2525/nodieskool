import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, MessageSquare, Calendar, Check, Globe, Zap, Shield, Star, Play, ArrowRight, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCommunities } from "@/hooks/useCommunities";
import { getAndClearRedirectUrl } from "@/hooks/useRedirectUrl";
import { ShinyButton } from "@/components/ui/shiny-button";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { FeatureCard } from "@/components/ui/feature-card";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { AuroraBackground } from "@/components/ui/aurora-background";
import tribbueLogoImg from "@/assets/tribbue-logo.png";
import { InstallBanner } from "@/components/pwa/InstallBanner";

const features = [
  { icon: <Users className="h-5 w-5" />, title: "Communauté engagée", description: "Créez un espace de discussion et d'entraide pour votre audience" },
  { icon: <BookOpen className="h-5 w-5" />, title: "Formations complètes", description: "Hébergez vos cours avec suivi de progression et quiz" },
  { icon: <MessageSquare className="h-5 w-5" />, title: "Messagerie privée", description: "Échangez en privé avec les membres de votre communauté" },
  { icon: <Calendar className="h-5 w-5" />, title: "Événements live", description: "Organisez des webinaires, masterclass et sessions Q&A" },
  { icon: <Zap className="h-5 w-5" />, title: "Performance optimale", description: "Une plateforme rapide et fiable pour une expérience fluide" },
  { icon: <Shield className="h-5 w-5" />, title: "Sécurité garantie", description: "Vos données et celles de vos membres sont protégées" },
];

const stats = [
  { value: "10k+", label: "Utilisateurs", icon: <Users className="h-4 w-4" /> },
  { value: "500+", label: "Communautés", icon: <Globe className="h-4 w-4" /> },
  { value: "50k+", label: "Cours suivis", icon: <BookOpen className="h-4 w-4" /> },
  { value: "99.9%", label: "Disponibilité", icon: <TrendingUp className="h-4 w-4" /> },
];

const benefits = [
  "Hébergement de cours illimité",
  "Messagerie privée intégrée",
  "Gestion des membres simplifiée",
  "Événements et calendrier",
  "Analytics et statistiques",
  "Support prioritaire",
];

export default function Landing() {
  const { user } = useAuth();
  const { publicCommunities } = useCommunities();
  const navigate = useNavigate();
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    setIsStandalone(!!standalone);
    if (standalone && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      if (localStorage.getItem('oauth_pending')) {
        localStorage.removeItem('oauth_pending');
      }
      const redirectUrl = getAndClearRedirectUrl();
      navigate(redirectUrl || "/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <InstallBanner />
      {/* Nav */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={tribbueLogoImg} alt="Tribbue" className="h-8 object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-5">
            <a href="#features" className="text-xs text-muted-foreground hover:text-primary transition-colors">Fonctionnalités</a>
            <Link to="/pricing" className="text-xs text-muted-foreground hover:text-primary transition-colors">Tarifs</Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <LiquidButton size="sm" href="/dashboard">Dashboard</LiquidButton>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex text-xs h-9 hover:bg-primary/5 hover:text-primary">
                  <Link to="/auth">Se connecter</Link>
                </Button>
                <LiquidButton size="sm" href="/auth">Commencer</LiquidButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero with Aurora */}
      <AuroraBackground className="h-auto min-h-0 py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto text-center relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Badge variant="secondary" className="mb-5 px-3 py-1.5 text-xs font-medium bg-primary/8 text-primary border-none rounded-full">
            Plateforme communautaire tout-en-un
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-5 leading-[1.1] tracking-tight">
            Créez votre<span className="block text-primary">communauté d'apprentissage</span>
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Rassemblez votre audience, partagez vos cours et créez une communauté engagée avec une plateforme <span className="text-foreground font-medium">simple et puissante</span>.
          </p>
          
          <div className="flex flex-col items-center gap-4 mb-10">
            <Link to={user ? "/dashboard" : "/auth"}>
              <ShinyButton>Créer ma communauté</ShinyButton>
            </Link>
            <LiquidButton size="lg" variant="outline" href="/pricing">
                <Play className="h-4 w-4" />
                Voir la démo
              </LiquidButton>
          </div>
        </div>
      </AuroraBackground>

      {/* Stats */}
      <section className="py-12 px-4 border-b border-border/50 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="relative group p-5 rounded-2xl border border-border/50 bg-background hover:border-primary/20 transition-all duration-300 text-center"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary group-hover:bg-primary/15 transition-colors">
                    {stat.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-0.5">{stat.value}</div>
                  <div className="text-[11px] text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3 text-xs rounded-full">Fonctionnalités</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Tout ce dont vous avez besoin</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              <TypingAnimation text="Une plateforme complète pour créer et développer votre communauté" delay={300} />
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                index={index}
                total={features.length}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge variant="secondary" className="mb-3 text-xs rounded-full">Gratuit pour commencer</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Lancez-vous gratuitement</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                <TypingAnimation text="Commencez avec notre plan gratuit et évoluez selon vos besoins. Pas de carte bancaire requise." delay={500} />
              </p>
              <ul className="space-y-2.5 mb-6">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 group">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"><Check className="h-3 w-3 text-primary" /></div>
                    <span className="text-sm text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
              <LiquidButton size="sm" href="/pricing">Voir les tarifs</LiquidButton>
            </div>
            <div className="relative group">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-primary/3 border border-border/50 shadow-lg flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-transparent" />
                <div className="relative text-center p-8">
                  <div className="h-16 w-16 rounded-2xl bg-primary mx-auto mb-3 flex items-center justify-center shadow-md shadow-primary/20"><Globe className="h-8 w-8 text-primary-foreground" /></div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Votre communauté</h3>
                  <p className="text-xs text-muted-foreground">Prête en quelques minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Communities */}
      {publicCommunities.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Communautés populaires</h2>
              <p className="text-sm text-muted-foreground">
                <TypingAnimation text="Rejoignez des communautés actives" delay={400} />
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {publicCommunities.slice(0, 3).map((community) => (
                <Link key={community.id} to={`/c/${community.slug}/community`} className="group/community block">
                  <div className="relative rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-lg hover:shadow-primary/5">
                    {/* Cover image */}
                    <div className="relative h-36 w-full overflow-hidden">
                      {community.cover_url ? (
                        <img
                          src={community.cover_url}
                          alt={community.name}
                          className="w-full h-full object-cover group-hover/community:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="w-full h-full group-hover/community:scale-105 transition-transform duration-500"
                          style={{
                            background: `linear-gradient(135deg, ${community.primary_color || 'hsl(var(--primary))'}, ${community.primary_color || 'hsl(var(--primary))'}66)`,
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      {/* Logo floating on cover */}
                      {community.logo_url && (
                        <div className="absolute bottom-3 left-3">
                          <img
                            src={community.logo_url}
                            alt=""
                            className="h-10 w-10 rounded-xl border-2 border-white/80 object-cover shadow-md"
                          />
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-4 pt-3">
                      <h3 className="font-semibold text-sm text-foreground mb-1 group-hover/community:text-primary transition-colors">{community.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{community.description || "Une communauté dynamique"}</p>
                    </div>
                    {/* Hover glow */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/community:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <LiquidButton size="sm" variant="outline" href="/discover">Voir toutes</LiquidButton>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative p-10 md:p-14 text-center rounded-3xl border border-border/50 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/3" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/5 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Prêt à créer votre communauté ?</h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-lg mx-auto">
                <TypingAnimation text="Rejoignez des milliers de créateurs qui utilisent notre plateforme" delay={600} />
              </p>
              <div className="flex justify-center">
                <Link to={user ? "/dashboard" : "/auth"}>
                  <ShinyButton>Commencer gratuitement</ShinyButton>
                </Link>
              </div>
              <p className="text-[11px] text-muted-foreground mt-5">Pas de carte bancaire • Annulez à tout moment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Install Banner (mobile only) - handled by InstallBanner component */}

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={tribbueLogoImg} alt="Tribbue" className="h-7 object-contain" />
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link to="/pricing" className="hover:text-primary transition-colors">Tarifs</Link>
            <Link to="/auth" className="hover:text-primary transition-colors">Connexion</Link>
          </div>
          <p className="text-[11px] text-muted-foreground">© 2026 Tribbue. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
