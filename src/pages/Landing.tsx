 import { Link } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Card } from "@/components/ui/card";
 import { 
   Users, 
   BookOpen, 
   Trophy, 
   Calendar, 
   Sparkles,
   ArrowRight,
   Check,
   Globe
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
         <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
           <Link to="/" className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
               <Sparkles className="h-5 w-5 text-primary-foreground" />
             </div>
             <span className="font-bold text-lg">Vibe Platform</span>
           </Link>
 
           <nav className="hidden md:flex items-center gap-6">
             <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
               Tarifs
             </Link>
             <Link to="/discover" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
               Découvrir
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
                 <Button variant="ghost" asChild>
                   <Link to="/auth">Se connecter</Link>
                 </Button>
                 <Button asChild>
                   <Link to="/auth">Commencer gratuitement</Link>
                 </Button>
               </>
             )}
           </div>
         </div>
       </header>
 
       {/* Hero Section */}
       <section className="py-20 px-4">
         <div className="max-w-4xl mx-auto text-center">
           <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
             <Sparkles className="h-4 w-4" />
             Plateforme communautaire tout-en-un
           </div>
           <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
             Créez votre communauté
             <span className="text-primary"> d'apprentissage</span>
           </h1>
           <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
             Rassemblez votre audience, partagez vos cours et créez une communauté 
             engagée avec une plateforme simple et puissante.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button size="lg" asChild>
               <Link to="/auth">
                 Créer ma communauté
                 <ArrowRight className="h-5 w-5 ml-2" />
               </Link>
             </Button>
             <Button size="lg" variant="outline" asChild>
               <Link to="/discover">
                 Explorer les communautés
               </Link>
             </Button>
           </div>
         </div>
       </section>
 
       {/* Features Grid */}
       <section className="py-20 px-4 bg-muted/30">
         <div className="max-w-6xl mx-auto">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-foreground mb-4">
               Tout ce dont vous avez besoin
             </h2>
             <p className="text-muted-foreground max-w-2xl mx-auto">
               Une plateforme complète pour créer, gérer et développer votre communauté
             </p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {features.map((feature) => (
               <Card key={feature.title} className="p-6 hover:shadow-lg transition-shadow">
                 <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                   <feature.icon className="h-6 w-6 text-primary" />
                 </div>
                 <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                 <p className="text-sm text-muted-foreground">{feature.description}</p>
               </Card>
             ))}
           </div>
         </div>
       </section>
 
       {/* Benefits Section */}
       <section className="py-20 px-4">
         <div className="max-w-6xl mx-auto">
           <div className="grid md:grid-cols-2 gap-12 items-center">
             <div>
               <h2 className="text-3xl font-bold text-foreground mb-6">
                 Lancez-vous gratuitement
               </h2>
               <p className="text-muted-foreground mb-8">
                 Commencez avec notre plan gratuit et évoluez selon vos besoins. 
                 Pas de carte bancaire requise.
               </p>
               <ul className="space-y-4">
                 {benefits.map((benefit) => (
                   <li key={benefit} className="flex items-center gap-3">
                     <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                       <Check className="h-4 w-4 text-primary" />
                     </div>
                     <span className="text-foreground">{benefit}</span>
                   </li>
                 ))}
               </ul>
               <Button className="mt-8" size="lg" asChild>
                 <Link to="/pricing">
                   Voir les tarifs
                   <ArrowRight className="h-5 w-5 ml-2" />
                 </Link>
               </Button>
             </div>
             <div className="relative">
               <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border flex items-center justify-center">
                 <Globe className="h-24 w-24 text-primary/30" />
               </div>
             </div>
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
       <section className="py-20 px-4">
         <div className="max-w-4xl mx-auto text-center">
           <h2 className="text-3xl font-bold text-foreground mb-6">
             Prêt à créer votre communauté ?
           </h2>
           <p className="text-muted-foreground mb-8">
             Rejoignez des milliers de créateurs qui utilisent notre plateforme
           </p>
           <Button size="lg" asChild>
             <Link to="/auth">
               Commencer gratuitement
               <ArrowRight className="h-5 w-5 ml-2" />
             </Link>
           </Button>
         </div>
       </section>
 
       {/* Footer */}
       <footer className="border-t py-8 px-4">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-2">
             <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
               <Sparkles className="h-4 w-4 text-primary-foreground" />
             </div>
             <span className="font-semibold text-sm">Vibe Platform</span>
           </div>
           <p className="text-sm text-muted-foreground">
             © 2024 Vibe Platform. Tous droits réservés.
           </p>
         </div>
       </footer>
     </div>
   );
 }