 import { Link } from "react-router-dom";
 import { motion } from "framer-motion";
 import { Button } from "@/components/ui/button";
 import { Card } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { 
   Users, 
   BookOpen, 
   Trophy, 
   Calendar, 
   Sparkles,
   ArrowRight,
   Check,
   Globe,
   Zap,
   Shield,
   Star,
   Play
 } from "lucide-react";
 import { useAuth } from "@/hooks/useAuth";
 import { useCommunities } from "@/hooks/useCommunities";
 
 const features = [
   {
     icon: Users,
     title: "Communauté engagée",
     description: "Créez un espace de discussion et d'entraide pour votre audience"
   },
   {
     icon: BookOpen,
     title: "Formations complètes",
     description: "Hébergez vos cours avec suivi de progression et quiz"
   },
   {
     icon: Trophy,
     title: "Gamification intégrée",
     description: "Points, badges et classements pour motiver vos membres"
   },
   {
     icon: Calendar,
     title: "Événements live",
     description: "Organisez des webinaires, masterclass et sessions Q&A"
   },
   {
     icon: Zap,
     title: "Performance optimale",
     description: "Une plateforme rapide et fiable pour une expérience fluide"
   },
   {
     icon: Shield,
     title: "Sécurité garantie",
     description: "Vos données et celles de vos membres sont protégées"
   },
 ];

 const stats = [
   { value: "10k+", label: "Utilisateurs actifs" },
   { value: "500+", label: "Communautés" },
   { value: "50k+", label: "Cours suivis" },
   { value: "99.9%", label: "Disponibilité" },
 ];
 
 const benefits = [
   "Hébergement de cours illimité",
   "Système de gamification intégré",
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
       {/* Navigation */}
       <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
           <Link to="/" className="flex items-center gap-2">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
               <Sparkles className="h-5 w-5 text-primary-foreground" />
             </div>
             <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Vibe Platform</span>
           </Link>
 
           <nav className="hidden md:flex items-center gap-6">
             <Link to="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
               Fonctionnalités
             </Link>
             <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
               Tarifs
             </Link>
           </nav>
 
           <div className="flex items-center gap-3">
             {user ? (
               <Button asChild>
                 <Link to="/dashboard">
                   Dashboard
                   <ArrowRight className="h-4 w-4 ml-2" />
                 </Link>
               </Button>
             ) : (
               <>
                 <Button variant="ghost" asChild className="hidden sm:inline-flex">
                   <Link to="/auth">Se connecter</Link>
                 </Button>
                 <Button asChild className="shadow-lg">
                   <Link to="/auth">Commencer gratuitement</Link>
                 </Button>
               </>
             )}
           </div>
         </div>
       </header>
 
       {/* Hero Section */}
       <section className="relative py-24 px-4 overflow-hidden">
         {/* Background decoration */}
         <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
         <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
         <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
         
         <motion.div 
           className="max-w-5xl mx-auto text-center relative"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
         >
           <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-none">
             <Sparkles className="h-4 w-4 mr-2" />
             Plateforme communautaire tout-en-un
           </Badge>
           
           <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight">
             Créez votre
             <span className="block text-primary">communauté d'apprentissage</span>
           </h1>
           
           <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
             Rassemblez votre audience, partagez vos cours et créez une communauté 
             engagée avec une plateforme <span className="text-foreground font-medium">simple et puissante</span>.
           </p>
           
           <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
             <Button size="lg" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-shadow" asChild>
               <Link to="/auth">
                 Créer ma communauté
                 <ArrowRight className="h-5 w-5 ml-2" />
               </Link>
             </Button>
             <Button size="lg" variant="outline" className="text-lg px-8 py-6 group" asChild>
               <Link to="/pricing">
                 <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                 Voir la démo
               </Link>
             </Button>
           </div>
 
           {/* Stats */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto pt-8 border-t">
             {stats.map((stat, i) => (
               <motion.div 
                 key={stat.label}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                 className="text-center"
               >
                 <div className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
                 <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
               </motion.div>
             ))}
           </div>
         </motion.div>
       </section>
 
       {/* Features Grid */}
       <section id="features" className="py-24 px-4 bg-muted/30">
         <div className="max-w-7xl mx-auto">
           <div className="text-center mb-12">
             <Badge variant="secondary" className="mb-4">Fonctionnalités</Badge>
             <h2 className="text-4xl font-bold text-foreground mb-4">
               Tout ce dont vous avez besoin
             </h2>
             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
               Une plateforme complète pour créer, gérer et développer votre communauté
             </p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {features.map((feature, i) => (
               <motion.div
                 key={feature.title}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.4, delay: i * 0.1 }}
                 viewport={{ once: true }}
               >
                 <Card className="p-6 h-full hover:shadow-lg transition-all hover:-translate-y-1 border-transparent hover:border-primary/20">
                   <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                   <feature.icon className="h-6 w-6 text-primary" />
                 </div>
                   <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                   <p className="text-muted-foreground">{feature.description}</p>
                 </Card>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
 
       {/* Benefits Section */}
       <section className="py-24 px-4">
         <div className="max-w-7xl mx-auto">
           <div className="grid md:grid-cols-2 gap-12 items-center">
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.6 }}
               viewport={{ once: true }}
             >
               <Badge variant="secondary" className="mb-4">Gratuit pour commencer</Badge>
               <h2 className="text-4xl font-bold text-foreground mb-6">
                 Lancez-vous gratuitement
               </h2>
               <p className="text-lg text-muted-foreground mb-8">
                 Commencez avec notre plan gratuit et évoluez selon vos besoins. 
                 Pas de carte bancaire requise.
               </p>
               <ul className="space-y-4 mb-8">
                 {benefits.map((benefit) => (
                   <li key={benefit} className="flex items-center gap-3">
                     <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                       <Check className="h-4 w-4 text-success" />
                     </div>
                     <span className="text-foreground text-lg">{benefit}</span>
                   </li>
                 ))}
               </ul>
               <Button size="lg" className="shadow-lg" asChild>
                 <Link to="/pricing">
                   Voir les tarifs
                   <ArrowRight className="h-5 w-5 ml-2" />
                 </Link>
               </Button>
             </motion.div>
             
             <motion.div 
               className="relative"
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.6 }}
               viewport={{ once: true }}
             >
               <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 border shadow-2xl flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                 <div className="relative text-center p-8">
                   <div className="h-20 w-20 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center shadow-xl">
                     <Globe className="h-10 w-10 text-primary-foreground" />
                   </div>
                   <h3 className="text-2xl font-bold text-foreground mb-2">Votre communauté</h3>
                   <p className="text-muted-foreground">Prête en quelques minutes</p>
                 </div>
               </div>
             </motion.div>
           </div>
         </div>
       </section>
 
       {/* Public Communities */}
       {publicCommunities.length > 0 && (
         <section className="py-20 px-4 bg-muted/30">
           <div className="max-w-6xl mx-auto">
             <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-foreground mb-4">
                 Communautés populaires
               </h2>
               <p className="text-muted-foreground">
                 Rejoignez des communautés actives et commencez à apprendre
               </p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {publicCommunities.slice(0, 3).map((community) => (
                 <Link key={community.id} to={`/c/${community.slug}/community`}>
                   <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                     <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-4">
                       {community.name.charAt(0)}
                     </div>
                     <h3 className="font-semibold text-foreground mb-2">{community.name}</h3>
                     <p className="text-sm text-muted-foreground line-clamp-2">
                       {community.description || "Une communauté dynamique"}
                     </p>
                   </Card>
                 </Link>
               ))}
             </div>
             <div className="text-center mt-8">
               <Button variant="outline" asChild>
                 <Link to="/discover">
                   Voir toutes les communautés
                   <ArrowRight className="h-4 w-4 ml-2" />
                 </Link>
               </Button>
             </div>
           </div>
         </section>
       )}
 
       {/* CTA Section */}
       <section className="py-24 px-4">
         <div className="max-w-5xl mx-auto">
           <Card className="p-12 md:p-16 text-center bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/10">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               viewport={{ once: true }}
             >
               <div className="inline-flex items-center justify-center gap-1 mb-6">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                 ))}
               </div>
               <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                 Prêt à créer votre communauté ?
               </h2>
               <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                 Rejoignez des milliers de créateurs qui utilisent notre plateforme pour enseigner et inspirer
               </p>
               <Button size="lg" className="text-lg px-10 py-6 shadow-xl" asChild>
                 <Link to="/auth">
                   Commencer gratuitement
                   <ArrowRight className="h-5 w-5 ml-2" />
                 </Link>
               </Button>
               <p className="text-sm text-muted-foreground mt-6">
                 Pas de carte bancaire requise • Annulez à tout moment
               </p>
             </motion.div>
           </Card>
         </div>
       </section>
 
       {/* Footer */}
       <footer className="border-t py-12 px-4 bg-muted/30">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
               <Sparkles className="h-5 w-5 text-primary-foreground" />
             </div>
             <span className="font-bold">Vibe Platform</span>
           </div>
           <div className="flex items-center gap-6 text-sm text-muted-foreground">
             <Link to="/pricing" className="hover:text-foreground transition-colors">Tarifs</Link>
             <Link to="/auth" className="hover:text-foreground transition-colors">Connexion</Link>
           </div>
           <p className="text-sm text-muted-foreground">
             © 2025 Vibe Platform. Tous droits réservés.
           </p>
         </div>
       </footer>
     </div>
   );
 }