import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, MessageSquare, Calendar, ArrowRight, Check, Globe, Zap, Shield, Star, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCommunities } from "@/hooks/useCommunities";
import tribbueLogoImg from "@/assets/tribbue-logo.png";

const features = [
  { icon: Users, title: "Communauté engagée", description: "Créez un espace de discussion et d'entraide pour votre audience" },
  { icon: BookOpen, title: "Formations complètes", description: "Hébergez vos cours avec suivi de progression et quiz" },
  { icon: MessageSquare, title: "Messagerie privée", description: "Échangez en privé avec les membres de votre communauté" },
  { icon: Calendar, title: "Événements live", description: "Organisez des webinaires, masterclass et sessions Q&A" },
  { icon: Zap, title: "Performance optimale", description: "Une plateforme rapide et fiable pour une expérience fluide" },
  { icon: Shield, title: "Sécurité garantie", description: "Vos données et celles de vos membres sont protégées" },
];

const stats = [
  { value: "10k+", label: "Utilisateurs" },
  { value: "500+", label: "Communautés" },
  { value: "50k+", label: "Cours suivis" },
  { value: "99.9%", label: "Disponibilité" },
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

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={tribbueLogoImg} alt="Tribbue" className="h-8 object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-5">
            <Link to="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Fonctionnalités</Link>
            <Link to="/pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Tarifs</Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild size="sm" className="rounded-xl text-xs h-9"><Link to="/dashboard">Dashboard<ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Link></Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex text-xs h-9"><Link to="/auth">Se connecter</Link></Button>
                <Button asChild size="sm" className="rounded-xl text-xs h-9 shadow-sm"><Link to="/auth">Commencer</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent pointer-events-none" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/8 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div className="max-w-3xl mx-auto text-center relative" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge variant="secondary" className="mb-5 px-3 py-1.5 text-xs font-medium bg-primary/8 text-primary border-none rounded-full">
            Plateforme communautaire tout-en-un
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-5 leading-[1.1] tracking-tight">
            Créez votre<span className="block text-primary">communauté d'apprentissage</span>
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Rassemblez votre audience, partagez vos cours et créez une communauté engagée avec une plateforme <span className="text-foreground font-medium">simple et puissante</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button size="lg" className="text-sm px-6 py-5 shadow-md rounded-xl" asChild>
              <Link to={user ? "/dashboard" : "/auth"}>Créer ma communauté<ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="text-sm px-6 py-5 group rounded-xl" asChild>
              <Link to="/pricing"><Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />Voir la démo</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto pt-8 border-t border-border/50">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3 text-xs rounded-full">Fonctionnalités</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Tout ce dont vous avez besoin</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">Une plateforme complète pour créer et développer votre communauté</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }} viewport={{ once: true }}>
                <Card className="p-5 h-full hover:shadow-card-hover transition-all duration-200 border-border/50 rounded-2xl shadow-card">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1.5">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
              <Badge variant="secondary" className="mb-3 text-xs rounded-full">Gratuit pour commencer</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Lancez-vous gratuitement</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Commencez avec notre plan gratuit et évoluez selon vos besoins. Pas de carte bancaire requise.</p>
              <ul className="space-y-2.5 mb-6">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0"><Check className="h-3 w-3 text-success" /></div>
                    <span className="text-sm text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
              <Button size="sm" className="shadow-sm rounded-xl text-xs h-9" asChild><Link to="/pricing">Voir les tarifs<ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Link></Button>
            </motion.div>
            <motion.div className="relative" initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/15 via-primary/8 to-accent/8 border border-border/50 shadow-lg flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                <div className="relative text-center p-8">
                  <div className="h-16 w-16 rounded-2xl bg-primary mx-auto mb-3 flex items-center justify-center shadow-md"><Globe className="h-8 w-8 text-primary-foreground" /></div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Votre communauté</h3>
                  <p className="text-xs text-muted-foreground">Prête en quelques minutes</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Public Communities */}
      {publicCommunities.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Communautés populaires</h2>
              <p className="text-sm text-muted-foreground">Rejoignez des communautés actives</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {publicCommunities.slice(0, 3).map((community) => (
                <Link key={community.id} to={`/c/${community.slug}/community`}>
                  <Card className="p-5 hover:shadow-card-hover transition-all duration-200 cursor-pointer rounded-2xl border-border/50 shadow-card">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-base mb-3">{community.name.charAt(0)}</div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">{community.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{community.description || "Une communauté dynamique"}</p>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button variant="outline" asChild size="sm" className="rounded-xl text-xs"><Link to="/discover">Voir toutes<ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Link></Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="p-10 md:p-14 text-center bg-gradient-to-br from-primary/3 via-background to-accent/3 border-border/50 rounded-2xl">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Prêt à créer votre communauté ?</h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-lg mx-auto">Rejoignez des milliers de créateurs qui utilisent notre plateforme</p>
              <Button size="lg" className="text-sm px-8 py-5 shadow-md rounded-xl" asChild>
                <Link to={user ? "/dashboard" : "/auth"}>Commencer gratuitement<ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
              <p className="text-[11px] text-muted-foreground mt-5">Pas de carte bancaire • Annulez à tout moment</p>
            </motion.div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={tribbueLogoImg} alt="Tribbue" className="h-7 object-contain" />
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link to="/pricing" className="hover:text-foreground transition-colors">Tarifs</Link>
            <Link to="/auth" className="hover:text-foreground transition-colors">Connexion</Link>
          </div>
          <p className="text-[11px] text-muted-foreground">© 2026 Tribbue. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
