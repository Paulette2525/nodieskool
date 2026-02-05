 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Switch } from "@/components/ui/switch";
 import { Label } from "@/components/ui/label";
 import { Separator } from "@/components/ui/separator";
 import { Settings, Shield, Users, Building2 } from "lucide-react";
 
 export function SuperAdminSettings() {
   return (
     <div className="space-y-6">
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Users className="h-5 w-5" />
             Inscriptions
           </CardTitle>
           <CardDescription>
             Gérez les paramètres d'inscription à la plateforme
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="flex items-center justify-between">
             <div className="space-y-0.5">
               <Label>Autoriser les nouvelles inscriptions</Label>
               <p className="text-sm text-muted-foreground">
                 Les visiteurs peuvent créer un compte
               </p>
             </div>
             <Switch defaultChecked />
           </div>
           <Separator />
           <div className="flex items-center justify-between">
             <div className="space-y-0.5">
               <Label>Confirmation email requise</Label>
               <p className="text-sm text-muted-foreground">
                 Les utilisateurs doivent confirmer leur email
               </p>
             </div>
             <Switch defaultChecked />
           </div>
         </CardContent>
       </Card>
 
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Building2 className="h-5 w-5" />
             Communautés
           </CardTitle>
           <CardDescription>
             Gérez les paramètres de création de communautés
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="flex items-center justify-between">
             <div className="space-y-0.5">
               <Label>Autoriser la création de communautés</Label>
               <p className="text-sm text-muted-foreground">
                 Les utilisateurs peuvent créer leurs propres communautés
               </p>
             </div>
             <Switch defaultChecked />
           </div>
           <Separator />
           <div className="flex items-center justify-between">
             <div className="space-y-0.5">
               <Label>Approbation requise</Label>
               <p className="text-sm text-muted-foreground">
                 Les nouvelles communautés nécessitent une approbation admin
               </p>
             </div>
             <Switch />
           </div>
         </CardContent>
       </Card>
 
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Shield className="h-5 w-5" />
             Sécurité
           </CardTitle>
           <CardDescription>
             Paramètres de sécurité de la plateforme
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="flex items-center justify-between">
             <div className="space-y-0.5">
               <Label>Modération automatique</Label>
               <p className="text-sm text-muted-foreground">
                 Filtrer automatiquement le contenu inapproprié
               </p>
             </div>
             <Switch />
           </div>
           <Separator />
           <div className="flex items-center justify-between">
             <div className="space-y-0.5">
               <Label>Notifications admin</Label>
               <p className="text-sm text-muted-foreground">
                 Recevoir des alertes pour les signalements
               </p>
             </div>
             <Switch defaultChecked />
           </div>
         </CardContent>
       </Card>
 
       <Card className="border-dashed">
         <CardHeader>
           <CardTitle className="flex items-center gap-2 text-muted-foreground">
             <Settings className="h-5 w-5" />
             Fonctionnalités à venir
           </CardTitle>
         </CardHeader>
         <CardContent>
           <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
             <li>Gestion des plans d'abonnement</li>
             <li>Limites personnalisées par plan</li>
             <li>Système de signalement</li>
             <li>Webhooks et intégrations</li>
             <li>Logs d'audit</li>
           </ul>
         </CardContent>
       </Card>
     </div>
   );
 }