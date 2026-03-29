 import { Link } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft } from "lucide-react";
import collonieLogoImg from "@/assets/collonie-logo.png";
 import { useAuth } from "@/hooks/useAuth";
 import { useSubscription } from "@/hooks/useSubscription";
 
 const plans = [
   {
     id: "free",
     name: "Gratuit",
     description: "Pour démarrer et tester la plateforme",
     priceMonthly: 0,
     priceYearly: 0,
     features: [
       "1 communauté",
       "Jusqu'à 100 membres",
       "Cours illimités",
       "Gamification basique",
       "Support par email",
     ],
     highlighted: false,
   },
   {
     id: "pro",
     name: "Pro",
     description: "Pour les créateurs sérieux",
     priceMonthly: 29,
     priceYearly: 290,
     features: [
       "3 communautés",
       "Jusqu'à 1000 membres par communauté",
       "Cours illimités",
       "Gamification avancée",
       "Analytics détaillés",
       "Support prioritaire",
       "Personnalisation des couleurs",
     ],
     highlighted: true,
   },
   {
     id: "business",
     name: "Business",
     description: "Pour les entreprises",
     priceMonthly: 99,
     priceYearly: 990,
     features: [
       "Communautés illimitées",
       "Membres illimités",
       "Cours illimités",
       "Toutes les fonctionnalités Pro",
       "Domaine personnalisé",
       "API access",
       "Support dédié",
       "Onboarding personnalisé",
     ],
     highlighted: false,
   },
 ];
 
 export default function Pricing() {
   const { user } = useAuth();
   const { currentPlan } = useSubscription();
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="border-b bg-card">
         <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
           <Button variant="ghost" size="icon" asChild>
             <Link to={user ? "/dashboard" : "/"}>
               <ArrowLeft className="h-5 w-5" />
             </Link>
           </Button>
            <Link to="/" className="flex items-center gap-2">
              <img src={collonieLogoImg} alt="Collonie" className="h-8 object-contain" />
              <span className="font-bold">Tarifs</span>
            </Link>
         </div>
       </header>
 
       {/* Pricing Section */}
       <main className="max-w-6xl mx-auto px-4 py-12">
         <div className="text-center mb-12">
           <h1 className="text-4xl font-bold text-foreground mb-4">
             Tarifs simples et transparents
           </h1>
           <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
             Choisissez le plan adapté à vos besoins. Évoluez quand vous voulez.
           </p>
         </div>
 
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
           {plans.map((plan) => {
             const isCurrentPlan = currentPlan === plan.id;
             
             return (
               <Card 
                 key={plan.id} 
                 className={plan.highlighted ? "border-primary shadow-lg relative" : ""}
               >
                 {plan.highlighted && (
                   <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                     Populaire
                   </Badge>
                 )}
                 <CardHeader>
                   <CardTitle className="flex items-center justify-between">
                     {plan.name}
                     {isCurrentPlan && (
                       <Badge variant="outline">Plan actuel</Badge>
                     )}
                   </CardTitle>
                   <CardDescription>{plan.description}</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="mb-6">
                     <span className="text-4xl font-bold text-foreground">
                       {plan.priceMonthly}€
                     </span>
                     <span className="text-muted-foreground">/mois</span>
                     {plan.priceYearly > 0 && (
                       <p className="text-sm text-muted-foreground mt-1">
                         ou {plan.priceYearly}€/an (2 mois offerts)
                       </p>
                     )}
                   </div>
 
                   <ul className="space-y-3 mb-6">
                     {plan.features.map((feature) => (
                       <li key={feature} className="flex items-start gap-2">
                         <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                         <span className="text-sm text-foreground">{feature}</span>
                       </li>
                     ))}
                   </ul>
 
                   {user ? (
                     isCurrentPlan ? (
                       <Button variant="outline" className="w-full" disabled>
                         Plan actuel
                       </Button>
                     ) : (
                        <Button 
                          className="w-full" 
                          variant={plan.highlighted ? "default" : "outline"}
                          asChild
                        >
                          <Link to="/contact">
                            {plan.priceMonthly === 0 ? "Sélectionner" : "Nous contacter"}
                          </Link>
                        </Button>
                     )
                   ) : (
                     <Button 
                       className="w-full" 
                       variant={plan.highlighted ? "default" : "outline"}
                       asChild
                     >
                       <Link to="/auth">Commencer</Link>
                     </Button>
                   )}
                 </CardContent>
               </Card>
             );
           })}
         </div>
 
         {/* FAQ or additional info */}
         <div className="text-center mt-12">
           <p className="text-muted-foreground">
             Des questions ? <Link to="/contact" className="text-primary hover:underline">Contactez-nous</Link>
           </p>
         </div>
       </main>
     </div>
   );
 }